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
  const series = await prisma.series.create({
    data: {
      title: 'The Midnight Chronicles',
      description: 'A gripping thriller series about a detective solving mysteries in a noir city.',
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

  // Create Videos
  console.log('Creating videos...');
  const videos = await Promise.all([
    // Free video
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
    // Paid video
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
    // Locked video (requires subscription)
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
    }),
    // Series episodes
    prisma.video.create({
      data: {
        title: 'The Midnight Chronicles - Ep 1: The Beginning',
        description: 'Detective Noir receives a mysterious case that will change everything.',
        thumbnail: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=600&fit=crop',
        videoUrl: 'https://sample-videos.com/midnight-ep1.mp4',
        duration: 300,
        creatorId: officialCreator.id,
        seriesId: series.id,
        episodeNumber: 1,
        isPublished: true,
        accessType: 'FREE',
        viewCount: 25000,
        likeCount: 2100
      }
    }),
    prisma.video.create({
      data: {
        title: 'The Midnight Chronicles - Ep 2: The Clue',
        description: 'A cryptic message leads Noir deeper into the conspiracy.',
        thumbnail: 'https://images.unsplash.com/photo-1533928298208-27ff66555d8d?w=400&h=600&fit=crop',
        videoUrl: 'https://sample-videos.com/midnight-ep2.mp4',
        duration: 320,
        creatorId: officialCreator.id,
        seriesId: series.id,
        episodeNumber: 2,
        isPublished: true,
        accessType: 'FREE',
        viewCount: 18000,
        likeCount: 1650
      }
    }),
    prisma.video.create({
      data: {
        title: 'The Midnight Chronicles - Ep 3: Betrayal',
        description: 'Noir discovers that someone close has been hiding the truth.',
        thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop',
        videoUrl: 'https://sample-videos.com/midnight-ep3.mp4',
        duration: 350,
        creatorId: officialCreator.id,
        seriesId: series.id,
        episodeNumber: 3,
        isPublished: true,
        accessType: 'PAID',
        price: 0.99,
        isPaid: true,
        isFree: false,
        previewDuration: 30,
        viewCount: 12000,
        likeCount: 980
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
