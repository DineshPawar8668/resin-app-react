import { Box, Typography, Card, CardContent, CardMedia, CardActionArea, Chip } from '@mui/material';
import { PlayCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PINK = { 600: '#F06292', 500: '#F48FB1' };

const DUMMY_VIDEOS = [
  {
    id: '1',
    title: 'Resin Art Basics - Getting Started',
    description: 'Learn the fundamentals of resin art, tools you need, and safety tips for beginners.',
    thumbnail: 'https://placehold.co/400x225/C2185B/white?text=Video+1',
    duration: '12:34',
    category: 'Beginner',
  },
  {
    id: '2',
    title: 'Ocean Wave Resin Tray Tutorial',
    description: 'Step-by-step guide to creating a beautiful ocean wave effect on a serving tray.',
    thumbnail: 'https://placehold.co/400x225/E91E8C/white?text=Video+2',
    duration: '18:22',
    category: 'Intermediate',
  },
  {
    id: '3',
    title: 'Geode Resin Art Masterclass',
    description: 'Create stunning geode-inspired resin art pieces using pigments and crystals.',
    thumbnail: 'https://placehold.co/400x225/C2185B/white?text=Video+3',
    duration: '25:10',
    category: 'Advanced',
  },
  {
    id: '4',
    title: 'Resin Jewellery Making',
    description: 'Craft elegant resin pendants, rings, and earrings from scratch.',
    thumbnail: 'https://placehold.co/400x225/E91E8C/white?text=Video+4',
    duration: '20:05',
    category: 'Intermediate',
  },
  {
    id: '5',
    title: 'Resin Coasters - Quick Project',
    description: 'Make a set of beautiful resin coasters in under an hour with minimal supplies.',
    thumbnail: 'https://placehold.co/400x225/C2185B/white?text=Video+5',
    duration: '09:48',
    category: 'Beginner',
  },
  {
    id: '6',
    title: 'Advanced Colour Mixing Techniques',
    description: 'Master the art of blending pigments, alcohol inks, and dyes in resin.',
    thumbnail: 'https://placehold.co/400x225/E91E8C/white?text=Video+6',
    duration: '22:17',
    category: 'Advanced',
  },
];

const categoryColor: Record<string, string> = {
  Beginner: '#4CAF50',
  Intermediate: '#FF9800',
  Advanced: '#F06292',
};

export const Videos = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', background: '#fafafa', pb: 6 }}>
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${PINK[600]} 0%, ${PINK[500]} 100%)`,
          py: 5,
          px: 2,
          textAlign: 'center',
          color: '#fff',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <PlayCircle size={34} />
          <Typography variant="h4" fontWeight={800}>
            Tutorial Videos
          </Typography>
        </Box>
        <Typography fontSize={16} sx={{ opacity: 0.88 }}>
          Watch step-by-step resin art tutorials crafted for every skill level
        </Typography>
      </Box>

      {/* Video Grid */}
      <Box
        sx={{
          maxWidth: 1200,
          mx: 'auto',
          px: { xs: 2, sm: 3 },
          mt: 4,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
          },
          gap: 3,
        }}
      >
        {DUMMY_VIDEOS.map((video) => (
          <Card
            key={video.id}
            sx={{
              borderRadius: 3,
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 24px rgba(194,24,91,0.18)',
              },
            }}
          >
            <CardActionArea onClick={() => navigate(`/videos/${video.id}`)}>
              <Box sx={{ position: 'relative' }}>
                <CardMedia
                  component="img"
                  height={200}
                  image={video.thumbnail}
                  alt={video.title}
                />
                {/* Play overlay */}
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0,0,0,0.18)',
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    '.MuiCardActionArea-root:hover &': { opacity: 1 },
                  }}
                >
                  <PlayCircle size={52} color="#fff" />
                </Box>
                {/* Duration badge */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    background: 'rgba(0,0,0,0.72)',
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 600,
                    borderRadius: 1,
                    px: 0.8,
                    py: 0.2,
                  }}
                >
                  {video.duration}
                </Box>
              </Box>

              <CardContent sx={{ pb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Chip
                    label={video.category}
                    size="small"
                    sx={{
                      backgroundColor: categoryColor[video.category] + '22',
                      color: categoryColor[video.category],
                      fontWeight: 700,
                      fontSize: 11,
                    }}
                  />
                </Box>
                <Typography fontWeight={700} fontSize={15} gutterBottom sx={{ lineHeight: 1.4 }}>
                  {video.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" fontSize={13} sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {video.description}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Box>
    </Box>
  );
};
