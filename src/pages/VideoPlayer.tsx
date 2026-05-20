import { Box, Typography, Chip, Button } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, PlayCircle } from 'lucide-react';

const PINK = { 600: '#C2185B', 500: '#E91E8C' };

// Drop your .mp4 files inside  public/videos/
// Then set video_url to just the filename, e.g. "tutorial-basics.mp4"
const VIDEO_FOLDER = '/videos/';

const DUMMY_VIDEOS = [
  {
    id: '1',
    title: 'Resin Art Basics - Getting Started',
    description: 'Learn the fundamentals of resin art, tools you need, and safety tips for beginners. This comprehensive guide covers everything you need to know before your first pour.',
    video_url: '6536658-uhd_3840_2160_25fps.mp4', // e.g. "resin-basics.mp4"
    duration: '12:34',
    category: 'Beginner',
  },
  {
    id: '2',
    title: 'Ocean Wave Resin Tray Tutorial',
    description: 'Step-by-step guide to creating a beautiful ocean wave effect on a serving tray. Follow along as we mix colours and create stunning wave patterns.',
    video_url: '6536658-uhd_3840_2160_25fps.mp4', // e.g. "ocean-wave.mp4"
    duration: '18:22',
    category: 'Intermediate',
  },
  {
    id: '3',
    title: 'Geode Resin Art Masterclass',
    description: 'Create stunning geode-inspired resin art pieces using pigments and crystals. A deep dive into advanced techniques for beautiful results.',
    video_url: '6536658-uhd_3840_2160_25fps.mp4', // e.g. "geode-masterclass.mp4"
    duration: '25:10',
    category: 'Advanced',
  },
  {
    id: '4',
    title: 'Resin Jewellery Making',
    description: 'Craft elegant resin pendants, rings, and earrings from scratch. Learn mould preparation, colour mixing, and finishing techniques.',
    video_url: '6536658-uhd_3840_2160_25fps.mp4', // e.g. "jewellery-making.mp4"
    duration: '20:05',
    category: 'Intermediate',
  },
  {
    id: '5',
    title: 'Resin Coasters - Quick Project',
    description: 'Make a set of beautiful resin coasters in under an hour with minimal supplies. Perfect for beginners looking for a quick win.',
    video_url: '6536658-uhd_3840_2160_25fps.mp4', // e.g. "coasters.mp4"
    duration: '09:48',
    category: 'Beginner',
  },
  {
    id: '6',
    title: 'Advanced Colour Mixing Techniques',
    description: 'Master the art of blending pigments, alcohol inks, and dyes in resin. Unlock the secrets to vibrant, consistent colour in your work.',
    video_url: '6536658-uhd_3840_2160_25fps.mp4', // e.g. "colour-mixing.mp4"
    duration: '22:17',
    category: 'Advanced',
  },
];

const categoryColor: Record<string, string> = {
  Beginner: '#4CAF50',
  Intermediate: '#FF9800',
  Advanced: '#C2185B',
};

const buildSrc = (filename: string) => `${VIDEO_FOLDER}${filename}`;

export const VideoPlayer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const video = DUMMY_VIDEOS.find((v) => v.id === id);

  if (!video) {
    return (
      <Box sx={{ textAlign: 'center', py: 10 }}>
        <Typography variant="h5" color="text.secondary">Video not found</Typography>
        <Button onClick={() => navigate('/videos')} sx={{ mt: 2, color: PINK[600] }}>
          Back to Videos
        </Button>
      </Box>
    );
  }

  const src = video.video_url ? buildSrc(video.video_url) : '';

  return (
    <Box sx={{ minHeight: '100vh', background: '#111', pb: 6 }}>
      {/* Back button */}
      <Box sx={{ background: '#1a1a1a', px: { xs: 2, md: 4 }, py: 1.5 }}>
        <Button
          startIcon={<ArrowLeft size={16} />}
          onClick={() => navigate('/videos')}
          sx={{ color: '#ccc', textTransform: 'none', '&:hover': { color: '#fff' } }}
        >
          Back to Videos
        </Button>
      </Box>

      <Box sx={{ maxWidth: 960, mx: 'auto', px: { xs: 0, sm: 2, md: 4 }, pt: { xs: 0, sm: 3 } }}>
        {/* Video Player */}
        <Box
          sx={{
            width: '100%',
            aspectRatio: '16/9',
            background: '#000',
            borderRadius: { xs: 0, sm: 2 },
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {src ? (
            <video
              key={src}
              src={src}
              controls
              autoPlay
              style={{ width: '100%', height: '100%' }}
            />
          ) : (
            <Box sx={{ textAlign: 'center' }}>
              <PlayCircle size={72} color="#333" />
              <Typography mt={2} fontSize={16} color="#555">
                Video coming soon
              </Typography>
            </Box>
          )}
        </Box>

        {/* Video Info */}
        <Box sx={{ px: { xs: 2, sm: 0 }, pt: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Chip
              label={video.category}
              size="small"
              sx={{
                backgroundColor: categoryColor[video.category] + '33',
                color: categoryColor[video.category],
                fontWeight: 700,
                fontSize: 12,
              }}
            />
            <Typography fontSize={13} color="#888">
              {video.duration}
            </Typography>
          </Box>

          <Typography variant="h5" fontWeight={800} color="#fff" gutterBottom>
            {video.title}
          </Typography>

          <Typography fontSize={14} color="#aaa" sx={{ lineHeight: 1.8 }}>
            {video.description}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
