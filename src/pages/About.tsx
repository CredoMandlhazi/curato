import { Award, Users, Music2, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { PageTransition } from "@/components/PageTransition";
import mdu1 from "@/assets/mdu-1.jpg";

const About = () => {
  const stats = [
    { icon: Music2, label: "Tracks Curated", value: "500+" },
    { icon: Users, label: "Producers Onboarded", value: "200+" },
    { icon: Award, label: "Top Selections", value: "50+" },
    { icon: Globe, label: "Countries Reached", value: "20+" },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen pt-24">
        <div className="studio-container py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid lg:grid-cols-2 gap-16 items-center mb-24"
          >
            <div>
              <h1 className="text-5xl md:text-7xl font-bold mb-6">Curato</h1>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Curato is a creator platform developed by Native Scope, designed to be the 
                  central engine of a new collaboration — bringing producers into a structured 
                  ecosystem where they can create, be discovered, and progress.
                </p>
                <p>
                  It serves as the gateway into the project, with access driven through FL Studio 
                  packs and anchored by real cultural participation. Backed by industry professionals 
                  and trusted curators, Curato is where raw talent meets structure.
                </p>
                <p>
                  The platform is in its final stages of development, with early backing from 
                  some of South Africa's most influential producers and cultural tastemakers.
                </p>
              </div>
            </div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="aspect-square rounded-2xl overflow-hidden">
                <img src={mdu1} alt="Music production" className="w-full h-full object-cover" />
              </div>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 text-center hover:border-foreground/20 transition-colors">
                  <stat.icon size={28} className="mx-auto mb-4 text-muted-foreground" />
                  <div className="text-3xl font-bold mb-2">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Mission */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-24"
          >
            <Card className="p-12 text-center">
              <h2 className="text-3xl font-bold mb-6">The Curato Vision</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Curato becomes the gateway into music creation in Africa — where producers start, 
                creators grow, and culture is shaped. We're not just helping producers make music. 
                We're building the system that turns them into recognised creators.
              </p>
            </Card>
          </motion.div>

          {/* Philosophy */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-8 hover:border-foreground/20 transition-colors">
                <h3 className="text-xl font-bold mb-4">Structure Over Chaos</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Talent exists. Structure doesn't. Curato provides the clear starting point, 
                  quality sounds, and feedback from credible producers that creators need.
                </p>
              </Card>
              
              <Card className="p-8 hover:border-foreground/20 transition-colors">
                <h3 className="text-xl font-bold mb-4">Culture-Driven Curation</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Reviewed by industry professionals, genre tastemakers, and prominent 
                  producers — real people who understand the sound.
                </p>
              </Card>
              
              <Card className="p-8 hover:border-foreground/20 transition-colors">
                <h3 className="text-xl font-bold mb-4">Creation → Career</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Top creators move into live performance showcases, studio collaborations, 
                  and future placements. Creation becomes career progression.
                </p>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default About;
