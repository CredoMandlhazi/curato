import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Download, Zap, Volume2, Clock, Waves, Loader2, Music, Headphones, Package } from "lucide-react";
import xlr8Plugin from "@/assets/xlr8-plugin.png";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const xlr8Features = [
  {
    icon: Volume2,
    title: "Compressor",
    description: "Smooth, transparent dynamics control with adjustable threshold, ratio, attack, release, and makeup gain."
  },
  {
    icon: Waves,
    title: "Plate Reverb",
    description: "Classic studio plate sound with decay, size, pre-delay, damping, and modulation controls."
  },
  {
    icon: Clock,
    title: "Stereo Delay",
    description: "Flexible delay with time, feedback, wet/dry mix, and ping-pong mode for rhythmic movement."
  }
];

const soundPacks = [
  {
    id: "producer-essentials",
    title: "Producer Essentials Vol. 1",
    description: "A versatile starter pack spanning hip-hop, Afrobeats, house, and R&B. Drums, bass lines, melodic loops, and vocal chops ready for any genre.",
    price: 29,
    features: ["150+ Samples", "20 MIDI Files", "10 Preset Patches", "FL Studio Ready"],
    badge: "Best Seller",
    icon: Music,
  },
  {
    id: "universal-drum-kit",
    title: "Universal Drum Kit",
    description: "Hard-hitting drums designed for every genre. Kicks, snares, hi-hats, and percussion crafted for hip-hop, pop, electronic, and beyond.",
    price: 19,
    features: ["200+ Drum Hits", "One-Shots", "Drum Loops", "Mix-Ready"],
    badge: "New",
    icon: Headphones,
  },
  {
    id: "curato-producer-pack",
    title: "Curato Producer Pack",
    description: "The official entry pack into the Curato ecosystem. Multi-genre samples, project templates, and tools to start creating immediately.",
    price: 49,
    features: ["300+ Samples", "Project Templates", "Curato Access", "Producer Guide"],
    badge: "Featured",
    icon: Package,
  },
];

const Shop = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPack, setLoadingPack] = useState<string | null>(null);
  const [isDownloadingDemo, setIsDownloadingDemo] = useState(false);

  const handlePurchase = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-xlr8-checkout', {
        body: { product_type: 'full' },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to start checkout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePackPurchase = async (packId: string) => {
    setLoadingPack(packId);
    try {
      const { data, error } = await supabase.functions.invoke('create-xlr8-checkout', {
        body: { product_type: packId },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to start checkout. Please try again.');
    } finally {
      setLoadingPack(null);
    }
  };

  const handleDemoDownload = () => {
    setIsDownloadingDemo(true);
    toast.success('Starting XLR8 Demo download...');
    setTimeout(() => {
      toast.info('Demo download will be available soon. Check back later!');
      setIsDownloadingDemo(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background pt-20">
      {/* Sound Packs Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge variant="secondary" className="mb-4">
              Curato × FL Studio
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight">
              Sound Packs
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Premium sounds curated by top producers across every genre. Your gateway into the Curato ecosystem.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
            {soundPacks.map((pack, index) => (
              <motion.div
                key={pack.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-card border border-border rounded-xl p-6 hover:border-foreground/20 transition-all flex flex-col"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-foreground/10 flex items-center justify-center">
                    <pack.icon className="w-6 h-6 text-foreground" />
                  </div>
                  <Badge variant="outline" className="text-xs">{pack.badge}</Badge>
                </div>
                <h3 className="text-xl font-semibold mb-2">{pack.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4 flex-grow">
                  {pack.description}
                </p>
                <ul className="space-y-2 mb-6">
                  {pack.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-foreground/60" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-2xl font-bold">${pack.price}</span>
                  <Button
                    onClick={() => handlePackPurchase(pack.id)}
                    disabled={loadingPack === pack.id}
                    className="gap-2"
                  >
                    {loadingPack === pack.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    {loadingPack === pack.id ? 'Processing...' : 'Buy Now'}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* XLR8 Plugin Section */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <Badge variant="secondary" className="mb-4">
              Signature Plugin
            </Badge>
            <h2 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight">
              <span className="bg-gradient-to-r from-primary via-orange-500 to-red-500 bg-clip-text text-transparent">
                XLR8
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground font-medium">
              Compress. Plate. Delay. <span className="text-foreground">Accelerated.</span>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto mb-16"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-primary/20 border border-border/50">
              <img src={xlr8Plugin} alt="XLR8 Plugin Interface" className="w-full h-auto" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent pointer-events-none" />
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center text-lg text-muted-foreground max-w-3xl mx-auto mb-12"
          >
            Transform your sound with the ultimate vocal and instrument FX chain. XLR8 combines 
            a precision compressor, lush plate reverb, and versatile stereo delay into a single, 
            rack-inspired plugin designed for producers, engineers, and musicians.
          </motion.p>

          {/* XLR8 Features */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
            {xlr8Features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-card border border-border rounded-xl p-6 hover:border-foreground/20 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-foreground/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          {/* XLR8 CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button 
              size="lg" 
              className="gap-2 text-lg px-8 py-6"
              onClick={handlePurchase}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
              {isLoading ? 'Processing...' : 'Buy XLR8 — $99'}
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="gap-2 text-lg px-8 py-6"
              onClick={handleDemoDownload}
              disabled={isDownloadingDemo}
            >
              {isDownloadingDemo ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
              {isDownloadingDemo ? 'Preparing...' : 'Try Free Demo'}
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Shop;
