import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Clear existing data (be careful in production!)
  console.log('Clearing existing data...');
  await prisma.challengeVote.deleteMany();
  await prisma.challengeEntry.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.clubMember.deleteMany();
  await prisma.club.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.like.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.userBadge.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.video.deleteMany();
  await prisma.series.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.teamInvitation.deleteMany();
  await prisma.rankTier.deleteMany();
  await prisma.user.deleteMany();

  // Create Rank Tiers
  console.log('Creating rank tiers...');
  const rankTiers = await Promise.all([
    prisma.rankTier.create({
      data: { name: 'Rookie', minLevel: 1, maxLevel: 20, icon: '🌱', color: '#22c55e' }
    }),
    prisma.rankTier.create({
      data: { name: 'Bronze', minLevel: 21, maxLevel: 50, icon: '🥉', color: '#cd7f32' }
    }),
    prisma.rankTier.create({
      data: { name: 'Silver', minLevel: 51, maxLevel: 100, icon: '🥈', color: '#c0c0c0' }
    }),
    prisma.rankTier.create({
      data: { name: 'Gold', minLevel: 101, maxLevel: 200, icon: '🥇', color: '#ffd700' }
    }),
    prisma.rankTier.create({
      data: { name: 'Platinum', minLevel: 201, maxLevel: 500, icon: '💎', color: '#a855f7' }
    }),
    prisma.rankTier.create({
      data: { name: 'Diamond', minLevel: 501, maxLevel: 9999, icon: '👑', color: '#3b82f6' }
    })
  ]);

  // Create Badges
  console.log('Creating badges...');
  const badges = await Promise.all([
    prisma.badge.create({
      data: {
        name: 'Official Account',
        type: 'OFFICIAL',
        icon: '✓',
        description: 'Platform-verified official account',
        criteria: 'Verified by Kreels team'
      }
    }),
    prisma.badge.create({
      data: {
        name: 'Verified Creator',
        type: 'VERIFIED_CREATOR',
        icon: '🎬',
        description: 'Verified content creator',
        criteria: 'Submit 10+ approved videos'
      }
    }),
    prisma.badge.create({
      data: {
        name: 'Top Contributor',
        type: 'TOP_CONTRIBUTOR',
        icon: '⭐',
        description: 'Top contributor in the community',
        criteria: 'Reach top 10% in engagement'
      }
    }),
    prisma.badge.create({
      data: {
        name: 'Rising Star',
        type: 'RISING_STAR',
        icon: '🚀',
        description: 'New creator showing fast growth',
        criteria: 'Gain 1000+ followers in first month'
      }
    }),
    prisma.badge.create({
      data: {
        name: 'Challenge Winner',
        type: 'CHALLENGE_WINNER',
        icon: '🏆',
        description: 'Won a community challenge',
        criteria: 'Win any challenge'
      }
    }),
    prisma.badge.create({
      data: {
        name: 'Club Founder',
        type: 'CLUB_FOUNDER',
        icon: '🎭',
        description: 'Founded an official club',
        criteria: 'Create a verified official club'
      }
    })
  ]);

  const hashedPassword = await bcrypt.hash('demo123', 10);

  // Create Demo Users
  console.log('Creating demo users...');

  // 1. Guest User (view only)
  const guestUser = await prisma.user.create({
    data: {
      email: 'guest@kreels.com',
      username: 'guest',
      displayName: 'Guest User',
      password: hashedPassword,
      userType: 'GUEST',
      bio: 'Exploring Kreels',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop',
      experiencePoints: 0,
      currentLevel: 1,
      currentRankId: rankTiers[0].id
    }
  });

  // 2. Individual Creator
  const individualUser = await prisma.user.create({
    data: {
      email: 'creator@kreels.com',
      username: 'sarah_creates',
      displayName: 'Sarah Chen',
      password: hashedPassword,
      userType: 'INDIVIDUAL',
      bio: 'Indie filmmaker and storyteller. Creating short dramas that touch the heart.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
      country: 'US',
      experiencePoints: 2500,
      currentLevel: 45,
      currentRankId: rankTiers[1].id
    }
  });

  // 3. Professional Account (Studio)
  const professionalUser = await prisma.user.create({
    data: {
      email: 'studio@kreels.com',
      username: 'starlightstudios',
      displayName: 'Starlight Studios',
      password: hashedPassword,
      userType: 'PROFESSIONAL',
      bio: 'Award-winning production studio. Creating premium short-form content.',
      avatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&h=150&fit=crop',
      country: 'US',
      experiencePoints: 15000,
      currentLevel: 150,
      currentRankId: rankTiers[3].id
    }
  });

  // 4. Official Creator (with badges)
  const officialCreator = await prisma.user.create({
    data: {
      email: 'official@kreels.com',
      username: 'marcus_official',
      displayName: 'Marcus Williams',
      password: hashedPassword,
      userType: 'PROFESSIONAL',
      bio: 'Emmy-nominated director. Official Kreels creator. Pushing boundaries in short-form storytelling.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
      country: 'US',
      experiencePoints: 50000,
      currentLevel: 350,
      currentRankId: rankTiers[4].id
    }
  });

  // 5. Admin User
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@kreels.com',
      username: 'kreels_admin',
      displayName: 'Kreels Admin',
      password: hashedPassword,
      userType: 'ADMIN',
      bio: 'Kreels Platform Administrator',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
      experiencePoints: 0,
      currentLevel: 1,
      currentRankId: rankTiers[0].id
    }
  });

  // Create team member for professional account
  const teamMember = await prisma.user.create({
    data: {
      email: 'editor@starlightstudios.com',
      username: 'jenny_editor',
      displayName: 'Jenny Park',
      password: hashedPassword,
      userType: 'INDIVIDUAL',
      bio: 'Video editor at Starlight Studios',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
      parentAccountId: professionalUser.id,
      isSubAccount: true,
      experiencePoints: 500,
      currentLevel: 15,
      currentRankId: rankTiers[0].id
    }
  });

  // Add team relationship
  await prisma.teamMember.create({
    data: {
      parentUserId: professionalUser.id,
      memberUserId: teamMember.id,
      role: 'UPLOADER',
      permissions: {
        upload: true,
        manage_club: false,
        manage_socials: false,
        analytics: true
      },
      status: 'ACTIVE',
      acceptedAt: new Date()
    }
  });

  // Assign badges to official creator
  console.log('Assigning badges...');
  await prisma.userBadge.createMany({
    data: [
      { userId: officialCreator.id, badgeId: badges[0].id }, // Official
      { userId: officialCreator.id, badgeId: badges[1].id }, // Verified Creator
      { userId: officialCreator.id, badgeId: badges[2].id }, // Top Contributor
      { userId: individualUser.id, badgeId: badges[3].id }   // Rising Star
    ]
  });

  // Create wallets
  console.log('Creating wallets...');
  await prisma.wallet.createMany({
    data: [
      { userId: guestUser.id, balance: 0, rewardsBalance: 0 },
      { userId: individualUser.id, balance: 50, rewardsBalance: 125.50 },
      { userId: professionalUser.id, balance: 500, rewardsBalance: 2500 },
      { userId: officialCreator.id, balance: 1000, rewardsBalance: 15000 },
      { userId: teamMember.id, balance: 25, rewardsBalance: 75 }
    ]
  });

  // Create follow relationships
  console.log('Creating follows...');
  await prisma.follow.createMany({
    data: [
      { followerId: guestUser.id, followingId: officialCreator.id },
      { followerId: guestUser.id, followingId: individualUser.id },
      { followerId: individualUser.id, followingId: officialCreator.id },
      { followerId: individualUser.id, followingId: professionalUser.id },
      { followerId: teamMember.id, followingId: officialCreator.id }
    ]
  });

  // Create Official Club
  console.log('Creating clubs...');
  const officialClub = await prisma.club.create({
    data: {
      name: 'Drama Creators Guild',
      description: 'The official community for drama creators. Share techniques, collaborate on projects, and participate in exclusive challenges.',
      avatar: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=150&h=150&fit=crop',
      banner: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&h=200&fit=crop',
      ownerId: officialCreator.id,
      isOfficial: true,
      verificationStatus: 'APPROVED',
      officialVerifiedAt: new Date(),
      members: {
        create: [
          { userId: officialCreator.id, role: 'OWNER' },
          { userId: individualUser.id, role: 'MEMBER' },
          { userId: professionalUser.id, role: 'ADMIN' }
        ]
      }
    }
  });

  // Award Club Founder badge
  await prisma.userBadge.create({
    data: {
      userId: officialCreator.id,
      badgeId: badges[5].id,
      contentId: officialClub.id
    }
  });

  // Create a regular club
  const regularClub = await prisma.club.create({
    data: {
      name: 'Indie Filmmakers',
      description: 'A community for independent filmmakers to share work and collaborate.',
      avatar: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=150&h=150&fit=crop',
      ownerId: individualUser.id,
      members: {
        create: [
          { userId: individualUser.id, role: 'OWNER' },
          { userId: teamMember.id, role: 'MEMBER' }
        ]
      }
    }
  });

  // Create Series
  console.log('Creating series...');

  // Series 1: The Midnight Chronicles (Thriller)
  const series1 = await prisma.series.create({
    data: {
      title: 'The Midnight Chronicles',
      description: 'A gripping thriller series about a detective solving mysteries in a noir city. Follow Detective Noir as he unravels a web of deceit and danger.',
      thumbnail: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=600&fit=crop',
      banner: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=200&fit=crop',
      category: 'Thriller',
      tags: ['mystery', 'noir', 'detective', 'drama'],
      creatorId: officialCreator.id,
      isPublished: true,
      totalEpisodes: 5,
      price: 4.99,
      isPaid: true,
      freeEpisodeCount: 2
    }
  });

  // Series 2: Love in Seoul (Romance)
  const series2 = await prisma.series.create({
    data: {
      title: 'Love in Seoul',
      description: 'A heartwarming K-drama style romance about two strangers who meet by chance and discover that fate has more in store for them.',
      thumbnail: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=600&fit=crop',
      banner: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=200&fit=crop',
      category: 'Romance',
      tags: ['romance', 'kdrama', 'love', 'seoul'],
      creatorId: professionalUser.id,
      isPublished: true,
      totalEpisodes: 5,
      price: 3.99,
      isPaid: true,
      freeEpisodeCount: 2
    }
  });

  // Series 3: Rising Star (Music Drama)
  const series3 = await prisma.series.create({
    data: {
      title: 'Rising Star',
      description: 'Follow the journey of Ji-yeon, a small-town girl with big dreams of becoming a K-pop idol. Through hardship and determination, she fights for her dream.',
      thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop',
      banner: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=200&fit=crop',
      category: 'Drama',
      tags: ['kpop', 'music', 'drama', 'idol'],
      creatorId: individualUser.id,
      isPublished: true,
      totalEpisodes: 5,
      price: 2.99,
      isPaid: true,
      freeEpisodeCount: 3
    }
  });

  // Series 4: Corporate Wars (Business Drama)
  const series4 = await prisma.series.create({
    data: {
      title: 'Corporate Wars',
      description: 'In the cutthroat world of tech startups, alliances shift and betrayals happen. Who will rise to the top?',
      thumbnail: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=400&h=600&fit=crop',
      banner: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=200&fit=crop',
      category: 'Drama',
      tags: ['business', 'corporate', 'drama', 'thriller'],
      creatorId: professionalUser.id,
      isPublished: true,
      totalEpisodes: 4,
      price: 5.99,
      isPaid: true,
      freeEpisodeCount: 1
    }
  });

  // Series 5: Haunted High (Horror)
  const series5 = await prisma.series.create({
    data: {
      title: 'Haunted High',
      description: 'Strange things are happening at Greenwood High. A group of students must uncover the dark secrets of their school before it is too late.',
      thumbnail: 'https://images.unsplash.com/photo-1509248961725-aec71c0e100a?w=400&h=600&fit=crop',
      banner: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&h=200&fit=crop',
      category: 'Horror',
      tags: ['horror', 'mystery', 'highschool', 'supernatural'],
      creatorId: officialCreator.id,
      isPublished: true,
      totalEpisodes: 4,
      price: 3.99,
      isPaid: true,
      freeEpisodeCount: 1
    }
  });

  // Create Episodes for all series
  console.log('Creating episodes...');

  // Series 1 Episodes: The Midnight Chronicles
  const series1Episodes = await Promise.all([
    prisma.video.create({
      data: {
        title: 'The Beginning',
        description: 'Detective Noir receives a mysterious case that will change everything. A wealthy businessman is found dead, and nothing is as it seems.',
        thumbnail: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=225&fit=crop',
        videoUrl: 'https://sample-videos.com/midnight-ep1.mp4',
        duration: 1800, // 30 min
        creatorId: officialCreator.id,
        seriesId: series1.id,
        seasonNumber: 1,
        episodeNumber: 1,
        isPublished: true,
        accessType: 'FREE',
        viewCount: 125000,
        likeCount: 8900
      }
    }),
    prisma.video.create({
      data: {
        title: 'The Clue',
        description: 'A cryptic message leads Noir deeper into the conspiracy. The victim had enemies everywhere, but who wanted him dead?',
        thumbnail: 'https://images.unsplash.com/photo-1533928298208-27ff66555d8d?w=400&h=225&fit=crop',
        videoUrl: 'https://sample-videos.com/midnight-ep2.mp4',
        duration: 1920, // 32 min
        creatorId: officialCreator.id,
        seriesId: series1.id,
        seasonNumber: 1,
        episodeNumber: 2,
        isPublished: true,
        accessType: 'FREE',
        viewCount: 98000,
        likeCount: 7200
      }
    }),
    prisma.video.create({
      data: {
        title: 'Betrayal',
        description: 'Noir discovers that someone close has been hiding the truth. Trust no one in this city of shadows.',
        thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=225&fit=crop',
        videoUrl: 'https://sample-videos.com/midnight-ep3.mp4',
        duration: 2100, // 35 min
        creatorId: officialCreator.id,
        seriesId: series1.id,
        seasonNumber: 1,
        episodeNumber: 3,
        isPublished: true,
        accessType: 'LOCKED',
        previewDuration: 60,
        viewCount: 76000,
        likeCount: 5800
      }
    }),
    prisma.video.create({
      data: {
        title: 'The Chase',
        description: 'With the killer closing in, Noir must race against time. Every second counts in this deadly game of cat and mouse.',
        thumbnail: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=225&fit=crop',
        videoUrl: 'https://sample-videos.com/midnight-ep4.mp4',
        duration: 2400, // 40 min
        creatorId: officialCreator.id,
        seriesId: series1.id,
        seasonNumber: 1,
        episodeNumber: 4,
        isPublished: true,
        accessType: 'LOCKED',
        previewDuration: 60,
        viewCount: 65000,
        likeCount: 4900
      }
    }),
    prisma.video.create({
      data: {
        title: 'Final Justice',
        description: 'The explosive finale. All secrets are revealed as Noir confronts the mastermind behind it all.',
        thumbnail: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=225&fit=crop',
        videoUrl: 'https://sample-videos.com/midnight-ep5.mp4',
        duration: 2700, // 45 min
        creatorId: officialCreator.id,
        seriesId: series1.id,
        seasonNumber: 1,
        episodeNumber: 5,
        isPublished: true,
        accessType: 'PAID',
        price: 1.99,
        isPaid: true,
        isFree: false,
        previewDuration: 60,
        viewCount: 52000,
        likeCount: 4200
      }
    })
  ]);

  // Series 2 Episodes: Love in Seoul
  const series2Episodes = await Promise.all([
    prisma.video.create({
      data: {
        title: 'Chance Encounter',
        description: 'Min-ji and Jun-ho bump into each other at a coffee shop. Little do they know, this is just the beginning.',
        thumbnail: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=225&fit=crop',
        videoUrl: 'https://sample-videos.com/seoul-ep1.mp4',
        duration: 1500, // 25 min
        creatorId: professionalUser.id,
        seriesId: series2.id,
        seasonNumber: 1,
        episodeNumber: 1,
        isPublished: true,
        accessType: 'FREE',
        viewCount: 89000,
        likeCount: 12500
      }
    }),
    prisma.video.create({
      data: {
        title: 'Second Meeting',
        description: 'They meet again at a friend\'s wedding. Is this fate? Min-ji starts to wonder if the universe is trying to tell her something.',
        thumbnail: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=225&fit=crop',
        videoUrl: 'https://sample-videos.com/seoul-ep2.mp4',
        duration: 1620, // 27 min
        creatorId: professionalUser.id,
        seriesId: series2.id,
        seasonNumber: 1,
        episodeNumber: 2,
        isPublished: true,
        accessType: 'FREE',
        viewCount: 78000,
        likeCount: 11200
      }
    }),
    prisma.video.create({
      data: {
        title: 'The Confession',
        description: 'Under the cherry blossoms, Jun-ho finally gathers the courage to confess his feelings.',
        thumbnail: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=400&h=225&fit=crop',
        videoUrl: 'https://sample-videos.com/seoul-ep3.mp4',
        duration: 1800, // 30 min
        creatorId: professionalUser.id,
        seriesId: series2.id,
        seasonNumber: 1,
        episodeNumber: 3,
        isPublished: true,
        accessType: 'LOCKED',
        previewDuration: 45,
        viewCount: 67000,
        likeCount: 9800
      }
    }),
    prisma.video.create({
      data: {
        title: 'Misunderstanding',
        description: 'A misunderstanding threatens to tear them apart. Will they find their way back to each other?',
        thumbnail: 'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?w=400&h=225&fit=crop',
        videoUrl: 'https://sample-videos.com/seoul-ep4.mp4',
        duration: 1740, // 29 min
        creatorId: professionalUser.id,
        seriesId: series2.id,
        seasonNumber: 1,
        episodeNumber: 4,
        isPublished: true,
        accessType: 'LOCKED',
        previewDuration: 45,
        viewCount: 58000,
        likeCount: 8500
      }
    }),
    prisma.video.create({
      data: {
        title: 'Forever Yours',
        description: 'The heartwarming finale where love conquers all. A perfect ending to a beautiful story.',
        thumbnail: 'https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?w=400&h=225&fit=crop',
        videoUrl: 'https://sample-videos.com/seoul-ep5.mp4',
        duration: 2100, // 35 min
        creatorId: professionalUser.id,
        seriesId: series2.id,
        seasonNumber: 1,
        episodeNumber: 5,
        isPublished: true,
        accessType: 'PAID',
        price: 1.49,
        isPaid: true,
        isFree: false,
        previewDuration: 45,
        viewCount: 45000,
        likeCount: 7200
      }
    })
  ]);

  // Series 3 Episodes: Rising Star
  const series3Episodes = await Promise.all([
    prisma.video.create({
      data: {
        title: 'The Audition',
        description: 'Ji-yeon takes her first step towards her dream by attending a major audition. Will she make the cut?',
        thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=225&fit=crop',
        videoUrl: 'https://sample-videos.com/star-ep1.mp4',
        duration: 1680, // 28 min
        creatorId: individualUser.id,
        seriesId: series3.id,
        seasonNumber: 1,
        episodeNumber: 1,
        isPublished: true,
        accessType: 'FREE',
        viewCount: 156000,
        likeCount: 18900
      }
    }),
    prisma.video.create({
      data: {
        title: 'Training Days',
        description: 'The grueling training begins. Ji-yeon struggles to keep up with her talented peers.',
        thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=225&fit=crop',
        videoUrl: 'https://sample-videos.com/star-ep2.mp4',
        duration: 1560, // 26 min
        creatorId: individualUser.id,
        seriesId: series3.id,
        seasonNumber: 1,
        episodeNumber: 2,
        isPublished: true,
        accessType: 'FREE',
        viewCount: 134000,
        likeCount: 16200
      }
    }),
    prisma.video.create({
      data: {
        title: 'First Performance',
        description: 'Ji-yeon faces her first public performance. The pressure is immense, but so is her determination.',
        thumbnail: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&h=225&fit=crop',
        videoUrl: 'https://sample-videos.com/star-ep3.mp4',
        duration: 1920, // 32 min
        creatorId: individualUser.id,
        seriesId: series3.id,
        seasonNumber: 1,
        episodeNumber: 3,
        isPublished: true,
        accessType: 'FREE',
        viewCount: 112000,
        likeCount: 14500
      }
    }),
    prisma.video.create({
      data: {
        title: 'Rivalry',
        description: 'A fierce rival emerges, threatening Ji-yeon\'s position in the group. The competition heats up.',
        thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=225&fit=crop',
        videoUrl: 'https://sample-videos.com/star-ep4.mp4',
        duration: 1740, // 29 min
        creatorId: individualUser.id,
        seriesId: series3.id,
        seasonNumber: 1,
        episodeNumber: 4,
        isPublished: true,
        accessType: 'LOCKED',
        previewDuration: 45,
        viewCount: 89000,
        likeCount: 11800
      }
    }),
    prisma.video.create({
      data: {
        title: 'Debut',
        description: 'The moment Ji-yeon has been waiting for. Against all odds, will her dreams finally come true?',
        thumbnail: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=225&fit=crop',
        videoUrl: 'https://sample-videos.com/star-ep5.mp4',
        duration: 2400, // 40 min
        creatorId: individualUser.id,
        seriesId: series3.id,
        seasonNumber: 1,
        episodeNumber: 5,
        isPublished: true,
        accessType: 'PAID',
        price: 0.99,
        isPaid: true,
        isFree: false,
        previewDuration: 60,
        viewCount: 72000,
        likeCount: 9500
      }
    })
  ]);

  // Series 4 Episodes: Corporate Wars
  const series4Episodes = await Promise.all([
    prisma.video.create({
      data: {
        title: 'The Pitch',
        description: 'Two rival startups compete for the same investor. In Silicon Valley, only one can survive.',
        thumbnail: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=400&h=225&fit=crop',
        videoUrl: 'https://sample-videos.com/corp-ep1.mp4',
        duration: 2100, // 35 min
        creatorId: professionalUser.id,
        seriesId: series4.id,
        seasonNumber: 1,
        episodeNumber: 1,
        isPublished: true,
        accessType: 'FREE',
        viewCount: 67000,
        likeCount: 5400
      }
    }),
    prisma.video.create({
      data: {
        title: 'Hostile Takeover',
        description: 'A shocking acquisition attempt sends shockwaves through the industry. Who is pulling the strings?',
        thumbnail: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=225&fit=crop',
        videoUrl: 'https://sample-videos.com/corp-ep2.mp4',
        duration: 2280, // 38 min
        creatorId: professionalUser.id,
        seriesId: series4.id,
        seasonNumber: 1,
        episodeNumber: 2,
        isPublished: true,
        accessType: 'LOCKED',
        previewDuration: 60,
        viewCount: 54000,
        likeCount: 4200
      }
    }),
    prisma.video.create({
      data: {
        title: 'The Leak',
        description: 'Confidential information is leaked to the press. Someone on the inside is a traitor.',
        thumbnail: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=225&fit=crop',
        videoUrl: 'https://sample-videos.com/corp-ep3.mp4',
        duration: 2040, // 34 min
        creatorId: professionalUser.id,
        seriesId: series4.id,
        seasonNumber: 1,
        episodeNumber: 3,
        isPublished: true,
        accessType: 'LOCKED',
        previewDuration: 60,
        viewCount: 45000,
        likeCount: 3600
      }
    }),
    prisma.video.create({
      data: {
        title: 'IPO Day',
        description: 'The dramatic conclusion. Everything rides on the biggest IPO in tech history.',
        thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=225&fit=crop',
        videoUrl: 'https://sample-videos.com/corp-ep4.mp4',
        duration: 2700, // 45 min
        creatorId: professionalUser.id,
        seriesId: series4.id,
        seasonNumber: 1,
        episodeNumber: 4,
        isPublished: true,
        accessType: 'PAID',
        price: 2.49,
        isPaid: true,
        isFree: false,
        previewDuration: 60,
        viewCount: 38000,
        likeCount: 3100
      }
    })
  ]);

  // Series 5 Episodes: Haunted High
  const series5Episodes = await Promise.all([
    prisma.video.create({
      data: {
        title: 'Welcome to Greenwood',
        description: 'New student Emma arrives at Greenwood High. But something feels very wrong about this school.',
        thumbnail: 'https://images.unsplash.com/photo-1509248961725-aec71c0e100a?w=400&h=225&fit=crop',
        videoUrl: 'https://sample-videos.com/haunted-ep1.mp4',
        duration: 1800, // 30 min
        creatorId: officialCreator.id,
        seriesId: series5.id,
        seasonNumber: 1,
        episodeNumber: 1,
        isPublished: true,
        accessType: 'FREE',
        viewCount: 98000,
        likeCount: 8200
      }
    }),
    prisma.video.create({
      data: {
        title: 'The Disappearance',
        description: 'A student goes missing. Emma and her friends begin to investigate the school\'s dark past.',
        thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=225&fit=crop',
        videoUrl: 'https://sample-videos.com/haunted-ep2.mp4',
        duration: 1920, // 32 min
        creatorId: officialCreator.id,
        seriesId: series5.id,
        seasonNumber: 1,
        episodeNumber: 2,
        isPublished: true,
        accessType: 'LOCKED',
        previewDuration: 45,
        viewCount: 82000,
        likeCount: 7100
      }
    }),
    prisma.video.create({
      data: {
        title: 'The Secret Room',
        description: 'A hidden room is discovered beneath the school. What horrors lie within?',
        thumbnail: 'https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=400&h=225&fit=crop',
        videoUrl: 'https://sample-videos.com/haunted-ep3.mp4',
        duration: 2040, // 34 min
        creatorId: officialCreator.id,
        seriesId: series5.id,
        seasonNumber: 1,
        episodeNumber: 3,
        isPublished: true,
        accessType: 'LOCKED',
        previewDuration: 45,
        viewCount: 71000,
        likeCount: 6200
      }
    }),
    prisma.video.create({
      data: {
        title: 'Final Night',
        description: 'The terrifying finale. Emma must face the evil head-on to save her friends and end the nightmare.',
        thumbnail: 'https://images.unsplash.com/photo-1604171099250-0f1c02a2c3b8?w=400&h=225&fit=crop',
        videoUrl: 'https://sample-videos.com/haunted-ep4.mp4',
        duration: 2400, // 40 min
        creatorId: officialCreator.id,
        seriesId: series5.id,
        seasonNumber: 1,
        episodeNumber: 4,
        isPublished: true,
        accessType: 'PAID',
        price: 1.99,
        isPaid: true,
        isFree: false,
        previewDuration: 60,
        viewCount: 62000,
        likeCount: 5400
      }
    })
  ]);

  // Create standalone videos
  console.log('Creating standalone videos...');
  const videos = await Promise.all([
    prisma.video.create({
      data: {
        title: 'The Last Train Home',
        description: 'A heartwarming short about second chances and finding your way back.',
        thumbnail: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=400&h=600&fit=crop',
        videoUrl: 'https://sample-videos.com/video123.mp4',
        duration: 180,
        creatorId: individualUser.id,
        isPublished: true,
        accessType: 'FREE',
        viewCount: 15420,
        likeCount: 892
      }
    }),
    prisma.video.create({
      data: {
        title: 'Shadows of Tomorrow',
        description: 'An exclusive premium short film exploring themes of identity and choice.',
        thumbnail: 'https://images.unsplash.com/photo-1518929458119-e5bf444c30f4?w=400&h=600&fit=crop',
        videoUrl: 'https://sample-videos.com/video456.mp4',
        duration: 420,
        creatorId: officialCreator.id,
        isPublished: true,
        accessType: 'PAID',
        price: 2.99,
        isPaid: true,
        isFree: false,
        previewDuration: 30,
        viewCount: 8750,
        likeCount: 1234
      }
    }),
    prisma.video.create({
      data: {
        title: 'Behind the Scenes: Drama Guild',
        description: 'Exclusive look into how our top creators make their content.',
        thumbnail: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=400&h=600&fit=crop',
        videoUrl: 'https://sample-videos.com/video789.mp4',
        duration: 600,
        creatorId: professionalUser.id,
        isPublished: true,
        accessType: 'LOCKED',
        previewDuration: 60,
        viewCount: 3200,
        likeCount: 567
      }
    })
  ]);

  // Create comments
  console.log('Creating comments...');
  await prisma.comment.createMany({
    data: [
      {
        userId: individualUser.id,
        videoId: videos[0].id,
        content: 'This is absolutely beautiful! The cinematography is stunning.'
      },
      {
        userId: teamMember.id,
        videoId: videos[0].id,
        content: 'Love the emotional depth in this piece. Keep creating!'
      },
      {
        userId: guestUser.id,
        videoId: videos[1].id,
        content: 'Incredible storytelling. Worth every penny!'
      }
    ]
  });

  // Create Challenge
  console.log('Creating challenges...');
  const challenge = await prisma.challenge.create({
    data: {
      clubId: officialClub.id,
      creatorId: officialCreator.id,
      title: 'New Year Story Challenge',
      description: 'Create a short story about new beginnings. Best entries will be featured and win prizes!',
      type: 'STORY_CO_CREATION',
      guidelines: 'Story must be original, 500-1000 words, and themed around "new beginnings".',
      thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop',
      entryTier: 'FREE',
      rewardAmount: 100,
      maxWinners: 3,
      status: 'ACTIVE',
      submissionEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      votingEnd: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
      prizePool: 300,
      entryCount: 2
    }
  });

  // Create challenge entries
  await prisma.challengeEntry.createMany({
    data: [
      {
        challengeId: challenge.id,
        userId: individualUser.id,
        title: 'Dawn of Dreams',
        content: 'A story about starting fresh after a life-changing moment...',
        voteCount: 15
      },
      {
        challengeId: challenge.id,
        userId: teamMember.id,
        title: 'The First Step',
        content: 'Sometimes all it takes is one small step to change everything...',
        voteCount: 8
      }
    ]
  });

  console.log('Seed completed successfully!');
  console.log('\n=== Demo Accounts ===');
  console.log('Guest:        guest@kreels.com / demo123');
  console.log('Creator:      creator@kreels.com / demo123');
  console.log('Studio:       studio@kreels.com / demo123');
  console.log('Official:     official@kreels.com / demo123');
  console.log('Admin:        admin@kreels.com / demo123');
  console.log('Team Member:  editor@starlightstudios.com / demo123');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
