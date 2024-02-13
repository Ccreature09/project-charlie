"use client"
import React from 'react';
import { db } from '@/firebase/firebase';
import { query, collection, where, getDocs } from 'firebase/firestore';
import { Level } from '@/interfaces';
import { Navbar } from '@/components/functional/navbar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { User } from '@/interfaces';

const backgroundImageStyle = {
  backgroundImage:
    "url('https://i.ibb.co/k2Lnz9t/blurry-gradient-haikei-1.png')",
  backgroundSize: 'cover',
  width: '100%',
};

const stripHtmlTags = (html: string): string => {
  return html.replace(/<[^>]*>?/gm, '');
};

export default function Page({ params }: { params: { query: string } }) {
  const [slug, setSlug] = React.useState(params.query);
  const [levels, setLevels] = React.useState<Level[]>([]);
  const [userProfiles, setUserProfiles] = React.useState<User[]>([]);

  React.useEffect(() => {
    const fetchResults = async () => {
      if (slug) {
        const searchQuery = decodeURIComponent(slug);

        // Query for level names
        const levelQuery = query(
          collection(db, 'levels'),
          where('name', '>=', searchQuery),
          where('name', '<=', searchQuery + '\uf8ff')
        );

        // Query for user profiles
        const userQuery = query(
          collection(db, 'users'),
          where('username', '>=', searchQuery),
          where('username', '<=', searchQuery + '\uf8ff')
        );

        try {
          const levelQuerySnapshot = await getDocs(levelQuery);
          const matchingLevels: Level[] = [];

          levelQuerySnapshot.forEach((levelDoc) => {
            const levelData = levelDoc.data() as Level;
            matchingLevels.push(levelData);
          });

          setLevels(matchingLevels);

          const userQuerySnapshot = await getDocs(userQuery);
          const matchingUserProfiles: User[] = [];

          userQuerySnapshot.forEach((userDoc) => {
            const userData = userDoc.data() as User;
            matchingUserProfiles.push(userData);
          });

          setUserProfiles(matchingUserProfiles);
        } catch (error) {
          console.error('Error fetching results:', error);
        }
      }
    };

    fetchResults();
  }, [slug]);

  return (
    <>
      <div style={backgroundImageStyle} className="h-screen ">
        <Navbar />

        <div className="m-20">
          <p className="text-3xl text-white mb-16">
            Results for <span className="font-semibold">{slug}</span>:
          </p>

          <div className="m-10">
            {userProfiles.map((user) => (
              <Link href={`/profile/${user.uid}`} key={user.uid}>
                <div className="bg-blue-100 flex rounded-lg p-5 my-5">
                  <img
                    src={user.pfp || 'default_profile_image_url'}
                    alt={user.username + ' image'}
                    className="w-48"
                  />
                  <div className="">
                    <p className="text-4xl font-bold ml-4">{user.username}</p>
                  </div>
                </div>
              </Link>
            ))}

            {levels.map((level) => (
              <div key={level.id}>
                <Link
                  href={`/level/${encodeURIComponent(level.id)}`}
                  className="flex bg-blue-100 rounded-lg p-5 my-5"
                >
                  <img
                    src={level.imgURL || 'https://etc.usf.edu/clipart/21900/21988/square_21988_md.gif'}
                    alt={level.name + ' image'}
                    className="w-1/4"
                  />
                  <div className="mx-10">
                    <div className="flex h-5 items-center space-x-4 ">
                      <Separator orientation="vertical" />
                      <p className="text-3xl font-semibold text-center ">{level.name}</p>
                      <Separator orientation="vertical" className="bg-black" />
                      <Badge className="bg-slate-400 rounded-lg">
                        <img src="https://i.ibb.co/VJhxNJV/Icon-1.png" className="w-3 mr-2" alt="" />
                        10x10
                      </Badge>

                      <Badge className="bg-slate-400 rounded-lg">
                        <img src="https://i.ibb.co/KhG75bv/Rectangle-5.png" className="w-4 mr-2" alt="" />
                        {level.difficulty}
                      </Badge>
                      <Badge className="bg-slate-400 rounded-lg">{level.unlimited ? 'Unlimited' : 'Limited'}</Badge>
                    </div>
                    {/* Strip HTML tags and render plain text */}
                    <p className="p-5 ml-4 font-medium">{stripHtmlTags(level.description)}</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
          <div></div>
        </div>
      </div>
    </>
  );
}
