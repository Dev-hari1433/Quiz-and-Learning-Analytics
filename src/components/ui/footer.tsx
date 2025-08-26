import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Instagram } from 'lucide-react';

interface FooterProps {
  whatsappNumber?: string;
  instagramId?: string;
}

const Footer = ({ whatsappNumber, instagramId }: FooterProps) => {
  const handleWhatsAppClick = () => {
    if (whatsappNumber) {
      window.open(`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`, '_blank');
    }
  };

  const handleInstagramClick = () => {
    if (instagramId) {
      window.open(`https://instagram.com/${instagramId.replace('@', '')}`, '_blank');
    }
  };

  return (
    <motion.footer
      className="relative z-10 mt-auto border-t border-border/20 bg-card/30 backdrop-blur-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 1.5 }}
    >
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Team Information */}
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground mb-2">
              Developed by
            </p>
            <p className="font-semibold text-foreground">
              <span className="text-primary">Fantastic Four Team</span>
            </p>
            <p className="text-sm text-muted-foreground">
              (TL) Hariharan, Parthiban, Sai Gowtham and Kishore
            </p>
          </div>

          {/* Contact Information */}
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">Contact:</p>
            
            {whatsappNumber && (
              <button
                onClick={handleWhatsAppClick}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card/50 border border-border/30 hover:bg-primary/10 hover:border-primary/30 transition-all duration-200 group"
              >
                <MessageCircle className="w-4 h-4 text-green-500 group-hover:text-green-400" />
                <span className="text-sm font-medium">WhatsApp</span>
              </button>
            )}

            {instagramId && (
              <button
                onClick={handleInstagramClick}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card/50 border border-border/30 hover:bg-primary/10 hover:border-primary/30 transition-all duration-200 group"
              >
                <Instagram className="w-4 h-4 text-pink-500 group-hover:text-pink-400" />
                <span className="text-sm font-medium">Instagram</span>
              </button>
            )}
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-6 border-t border-border/20 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} EduQuizAI. All rights reserved.
          </p>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;