import { useState, useRef, useEffect } from "react";
import { Box, Typography, IconButton, GlobalStyles } from "@mui/material";
import { X, MessageCircle, ChevronLeft, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ── Brand colours ─────────────────────────── */
const PINK = { 600: "#C2185B", 500: "#D81B60", 400: "#E91E63", 50: "#FFF0F6", 100: "#FCE4EC" };

/* ── Conversation Flow ─────────────────────── */
interface FlowOption {
  label: string;
  next: string;
  url?: string;
}

interface FlowNode {
  message: string;
  options: FlowOption[];
}

const FLOW: Record<string, FlowNode> = {
  welcome: {
    message:
      "Hi there! Welcome to Shopi Nova ✨\n\nWe handcraft premium resin frames, wedding varmala preservations, and beautiful gifting hampers for your special days.\n\nHow can we help you today?",
    options: [
      { label: "🌸 Varmala & Wedding Preservation", next: "varmala" },
      { label: "🎁 Birthday & Anniversary Hampers", next: "hampers" },
      { label: "💍 Engagement Platters & Pooja Plates", next: "engagement" },
      { label: "✨ Everyday Resin Art & Rakhis", next: "resin" },
      { label: "🚚 Track My Order", next: "track" },
      { label: "🧑‍💻 Talk to a Designer", next: "designer" },
    ],
  },

  varmala: {
    message:
      "Preserve your wedding memories forever! 💍\n\nWe specialize in preserving Varmala flowers, bridal kaleere, and wedding cards into stunning resin frames or heavy blocks.\n\nNeed to ship your flowers? We'll guide you with studio address and careful packing instructions.",
    options: [
      { label: "🖼️ View Preservation Designs", next: "nav", url: "/products" },
      { label: "📦 Ship My Flowers – Get Studio Address", next: "varmala_ship" },
      { label: "🏠 Back to Main Menu", next: "welcome" },
    ],
  },

  varmala_ship: {
    message:
      "📦 How to ship your precious flowers to us:\n\n1. Gently dry the flowers with paper towels\n2. Place in an airtight zip-lock bag\n3. Pack carefully with bubble wrap\n4. Chat with our designer for the exact studio address\n\nWe'll handle everything from there with utmost care! 💕",
    options: [
      { label: "🧑‍💻 Talk to a Designer Now", next: "designer" },
      { label: "🏠 Back to Main Menu", next: "welcome" },
    ],
  },

  hampers: {
    message:
      "🎁 Looking for the perfect gift?\n\nWe curate gorgeous custom hampers for Birthdays, Anniversaries, and special milestones!\n\nTip: Tell us your budget and occasion, and we can customize a hamper just for you! 🌟",
    options: [
      { label: "🛍️ Explore Hampers Collection", next: "nav", url: "/products" },
      { label: "💬 Customize My Hamper", next: "hampers_custom" },
      { label: "🏠 Back to Main Menu", next: "welcome" },
    ],
  },

  hampers_custom: {
    message:
      "💖 Wonderful! Our designers love creating custom hampers.\n\nPlease share the following with our team:\n• Your budget range (e.g., ₹500 – ₹2000)\n• The occasion (Birthday / Anniversary / Other)\n• Any specific items you'd like included\n\nConnect with our designer and they'll craft something magical! ✨",
    options: [
      { label: "🧑‍💻 Chat with a Designer", next: "designer" },
      { label: "🏠 Back to Main Menu", next: "welcome" },
    ],
  },

  engagement: {
    message:
      "💍 Make your ceremony unforgettable!\n\nWe design premium customized:\n• Engagement Ring Platters\n• Haldi / Kumkum Pooja Plates\n• Festive Shubh Labh Resin Décor\n\nWant custom names or dates added? Just let our team know! 🎊",
    options: [
      { label: "🎨 Browse Platters & Pooja Plates", next: "nav", url: "/products" },
      { label: "✍️ Add Custom Names / Dates", next: "engagement_custom" },
      { label: "🏠 Back to Main Menu", next: "welcome" },
    ],
  },

  engagement_custom: {
    message:
      "✍️ Adding custom names, dates, or messages is our specialty!\n\nHere's how it works:\n1. Browse & select your platter design\n2. Add to cart\n3. In the order notes — mention your customization\n\nOr simply chat with our designer for a fully personalized piece! 💕",
    options: [
      { label: "🧑‍💻 Talk to a Designer", next: "designer" },
      { label: "🛍️ Browse Products", next: "nav", url: "/products" },
      { label: "🏠 Back to Main Menu", next: "welcome" },
    ],
  },

  resin: {
    message:
      "✨ Explore our beautiful range of custom resin art!\n\n• Custom Photo Frames\n• Seasonal Exclusives & Limited Editions\n• Personalized Resin Rakhis\n• Home Décor & more\n\nEvery piece is handcrafted with love, just for you! 💖",
    options: [
      { label: "🛍️ Shop the Collection", next: "nav", url: "/products" },
      { label: "🧑‍💻 Want Something Custom?", next: "designer" },
      { label: "🏠 Back to Main Menu", next: "welcome" },
    ],
  },

  track: {
    message:
      "📦 Anticipating your beautiful order?\n\nTo track your order, visit your order history page with your Order ID. Our team ships with care and you'll receive updates at every step!\n\nFor live tracking assistance, our support team is always here. 🚚",
    options: [
      { label: "📋 View My Orders", next: "nav", url: "/my-orders" },
      { label: "🧑‍💻 Contact Support Team", next: "designer" },
      { label: "🏠 Back to Main Menu", next: "welcome" },
    ],
  },

  designer: {
    message:
      "🎨 Connecting you to our creative team!\n\nOne of our designers will get back to you shortly. For instant assistance, reach us on WhatsApp — we typically respond within minutes! 💬\n\nDescribe your requirements and we'll follow up with a custom quote.",
    options: [
      { label: "💬 Chat on WhatsApp", next: "whatsapp" },
      { label: "🏠 Back to Main Menu", next: "welcome" },
    ],
  },
};

/* ── Message types ─────────────────────────── */
interface ChatMessage {
  id: number;
  from: "bot" | "user";
  text: string;
  options?: FlowOption[];
  optionsUsed?: boolean;
}

/* ── Component ─────────────────────────────── */
export const ChatBot = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showLabel, setShowLabel] = useState(true);
  const msgEndRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef(0);

  const nextId = () => ++counterRef.current;

  /* hide the "Ask Me" label after 4 s */
  useEffect(() => {
    const t = setTimeout(() => setShowLabel(false), 4000);
    return () => clearTimeout(t);
  }, []);

  /* send welcome when chat opens */
  useEffect(() => {
    if (open && messages.length === 0) {
      const node = FLOW.welcome;
      setMessages([{ id: nextId(), from: "bot", text: node.message, options: node.options }]);
    }
  }, [open]);

  /* scroll to bottom on new messages */
  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleOption = (opt: FlowOption, msgId: number) => {
    /* mark options as used so they hide (already chosen) */
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, optionsUsed: true } : m))
    );

    /* push user bubble */
    const userMsg: ChatMessage = { id: nextId(), from: "user", text: opt.label };
    setMessages((prev) => [...prev, userMsg]);

    /* handle special actions */
    if (opt.next === "nav" && opt.url) {
      navigate(opt.url);
      setOpen(false);
      return;
    }

    if (opt.next === "whatsapp") {
      window.open("https://wa.me/919XXXXXXXXX", "_blank");
      const node = FLOW.welcome;
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: nextId(),
            from: "bot",
            text: "Anything else I can help you with? 😊",
            options: node.options,
          },
        ]);
      }, 600);
      return;
    }

    /* normal flow node */
    const node = FLOW[opt.next];
    if (!node) return;

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: nextId(), from: "bot", text: node.message, options: node.options },
      ]);
    }, 500);
  };

  const handleClose = () => setOpen(false);
  const handleOpen = () => {
    setOpen(true);
    setShowLabel(false);
  };

  const handleReset = () => {
    counterRef.current = 0;
    const node = FLOW.welcome;
    setMessages([{ id: nextId(), from: "bot", text: node.message, options: node.options }]);
  };

  return (
    <>
      {/* Global keyframe for pulse */}
      <GlobalStyles
        styles={{
          "@keyframes chatPulse": {
            "0%, 100%": { boxShadow: `0 0 0 0 rgba(194,24,91,0.5)` },
            "50%": { boxShadow: `0 0 0 10px rgba(194,24,91,0)` },
          },
          "@keyframes chatSlideUp": {
            from: { opacity: 0, transform: "translateY(20px) scale(0.96)" },
            to: { opacity: 1, transform: "translateY(0) scale(1)" },
          },
          "@keyframes labelPop": {
            from: { opacity: 0, transform: "translateX(8px)" },
            to: { opacity: 1, transform: "translateX(0)" },
          },
          "@keyframes typingDot": {
            "0%, 80%, 100%": { transform: "scale(0.7)", opacity: 0.5 },
            "40%": { transform: "scale(1)", opacity: 1 },
          },
        }}
      />

      {/* ── Chat Window ───────────────────────── */}
      {open && (
        <Box
          sx={{
            position: "fixed",
            bottom: { xs: 80, sm: 90 },
            right: { xs: 12, sm: 24 },
            width: { xs: "calc(100vw - 24px)", sm: 370 },
            maxHeight: { xs: "55vh", sm: 420 },
            display: "flex",
            flexDirection: "column",
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
            zIndex: 1400,
            animation: "chatSlideUp 0.28s ease",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              background: `linear-gradient(135deg, ${PINK[600]} 0%, ${PINK[400]} 100%)`,
              px: 2,
              py: 1.5,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              flexShrink: 0,
            }}
          >
            {/* Avatar */}
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                border: "2px solid rgba(255,255,255,0.4)",
              }}
            >
              <Sparkles size={18} color="#fff" />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography fontWeight={700} fontSize={14} color="#fff" noWrap>
                Shopi Nova Assistant
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                <Box
                  sx={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#69F0AE",
                    flexShrink: 0,
                  }}
                />
                <Typography fontSize={11} sx={{ color: "rgba(255,255,255,0.85)" }}>
                  Online · Typically replies instantly
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={handleReset}
              size="small"
              sx={{ color: "rgba(255,255,255,0.7)", "&:hover": { color: "#fff", background: "rgba(255,255,255,0.12)" }, p: 0.7 }}
              title="Restart chat"
            >
              <ChevronLeft size={16} />
            </IconButton>
            <IconButton
              onClick={handleClose}
              size="small"
              sx={{ color: "rgba(255,255,255,0.7)", "&:hover": { color: "#fff", background: "rgba(255,255,255,0.12)" }, p: 0.7 }}
            >
              <X size={16} />
            </IconButton>
          </Box>

          {/* Messages Area */}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              background: "#f8f5f7",
              px: 1.5,
              py: 1.5,
              display: "flex",
              flexDirection: "column",
              gap: 1.2,
              "&::-webkit-scrollbar": { width: 4 },
              "&::-webkit-scrollbar-thumb": { background: PINK[100], borderRadius: 4 },
            }}
          >
            {messages.map((msg) => (
              <Box key={msg.id}>
                {msg.from === "bot" ? (
                  <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
                    {/* Bot avatar dot */}
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: `linear-gradient(135deg, ${PINK[600]}, ${PINK[400]})`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        mb: msg.options && !msg.optionsUsed ? "auto" : 0,
                        mt: "2px",
                      }}
                    >
                      <Sparkles size={13} color="#fff" />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      {/* Bot bubble */}
                      <Box
                        sx={{
                          background: "#fff",
                          borderRadius: "4px 16px 16px 16px",
                          px: 1.5,
                          py: 1.2,
                          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                          maxWidth: "90%",
                          display: "inline-block",
                        }}
                      >
                        <Typography
                          fontSize={13}
                          color="#222"
                          sx={{ whiteSpace: "pre-line", lineHeight: 1.65 }}
                        >
                          {msg.text}
                        </Typography>
                      </Box>

                      {/* Option buttons — only shown if not yet used */}
                      {msg.options && !msg.optionsUsed && (
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 0.8,
                            mt: 1,
                            maxWidth: "92%",
                          }}
                        >
                          {msg.options.map((opt, i) => (
                            <Box
                              key={i}
                              onClick={() => handleOption(opt, msg.id)}
                              sx={{
                                px: 1.4,
                                py: 0.9,
                                borderRadius: "10px",
                                border: `1.5px solid ${PINK[100]}`,
                                background: "#fff",
                                cursor: "pointer",
                                fontSize: 12.5,
                                fontWeight: 600,
                                color: PINK[600],
                                transition: "all 0.15s",
                                userSelect: "none",
                                "&:hover": {
                                  background: PINK[50],
                                  borderColor: PINK[500],
                                  transform: "translateX(3px)",
                                },
                                "&:active": { transform: "scale(0.97)" },
                              }}
                            >
                              {opt.label}
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>
                  </Box>
                ) : (
                  /* User bubble */
                  <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <Box
                      sx={{
                        background: `linear-gradient(135deg, ${PINK[600]}, ${PINK[500]})`,
                        borderRadius: "16px 4px 16px 16px",
                        px: 1.5,
                        py: 1,
                        maxWidth: "78%",
                        boxShadow: "0 2px 8px rgba(194,24,91,0.2)",
                      }}
                    >
                      <Typography fontSize={12.5} color="#fff" fontWeight={500}>
                        {msg.text}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            ))}
            <div ref={msgEndRef} />
          </Box>

          {/* Footer branding */}
          <Box
            sx={{
              background: "#fff",
              px: 2,
              py: 0.8,
              borderTop: "1px solid #f0f0f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 0.5,
              flexShrink: 0,
            }}
          >
            <Typography fontSize={10.5} color="#bbb" fontWeight={500}>
              Powered by
            </Typography>
            <Typography
              fontSize={10.5}
              fontWeight={700}
              sx={{
                background: `linear-gradient(135deg, ${PINK[600]}, ${PINK[400]})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Shopi Nova
            </Typography>
          </Box>
        </Box>
      )}

      {/* ── Floating Button ───────────────────── */}
      <Box
        sx={{
          position: "fixed",
          bottom: { xs: 16, sm: 24 },
          right: { xs: 12, sm: 24 },
          zIndex: 1400,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        {/* "Ask Me" label */}
        {showLabel && !open && (
          <Box
            sx={{
              background: "#fff",
              color: PINK[600],
              fontSize: 12,
              fontWeight: 700,
              px: 1.5,
              py: 0.7,
              borderRadius: "20px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
              border: `1.5px solid ${PINK[100]}`,
              animation: "labelPop 0.3s ease",
              whiteSpace: "nowrap",
              pointerEvents: "none",
            }}
          >
            👋 Ask Me!
          </Box>
        )}

        {/* FAB */}
        <Box
          onClick={open ? handleClose : handleOpen}
          sx={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: open
              ? "#555"
              : `linear-gradient(135deg, ${PINK[600]} 0%, ${PINK[400]} 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: open
              ? "0 4px 16px rgba(0,0,0,0.2)"
              : `0 6px 24px rgba(194,24,91,0.45)`,
            transition: "all 0.25s ease",
            animation: open ? "none" : "chatPulse 2.4s ease-in-out infinite",
            "&:hover": {
              transform: "scale(1.08)",
            },
            "&:active": { transform: "scale(0.95)" },
          }}
        >
          {open ? (
            <X size={22} color="#fff" />
          ) : (
            <MessageCircle size={22} color="#fff" />
          )}
        </Box>
      </Box>
    </>
  );
};
