import { Link } from "react-router-dom";
import { ArrowRight, Upload, Users, TrendingUp, CheckCircle, Heart, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { HeroCarousel } from "@/components/HeroCarousel";
import { PageTransition } from "@/components/PageTransition";
import curatoLogoNew from "@/assets/curato-logo-new.png";

const Home = () => {
  const howItWorksSteps = [
    {
      icon: Upload,
      title: "Submit Your Track",
      description: "Producers upload their music to Curato. All genres welcome — from Amapiano to hip-hop, Afrobeats to electronic.",
    },
    {
      icon: Heart,
      title: "Community Reacts",
      description: "The community listens, likes, comments, and shares. Engagement signals surface the best content organically.",
    },
    {
      icon: TrendingUp,
      title: "Curators Shortlist",
      description: "Community curators review the top-performing tracks and shortlist the best for final validation.",
    },
    {
      icon: CheckCircle,
      title: "Experts Validate",
      description: "Industry professionals and genre tastemakers give the final co-sign on what matters.",
    },
  ];

  const layers = [
    {
      title: "Community",
      description: "Producers, listeners, and creators — uploading tracks, liking, commenting, and sharing to generate quality signals at scale.",
      icon: Users,
    },
    {
      title: "Community Curators",
      description: "Upcoming producers and niche tastemakers who filter and shortlist content. Rewarded with exposure and status.",
      icon: TrendingUp,
    },
    {
      title: "Top Curators",
      description: "Industry professionals and key genre tastemakers who do the final validation. They decide what matters.",
      icon: Trophy,
    },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen pt-20">
        {/* Hero Section */}
        <section className="min-h-[90vh] flex items-center">
          <div className="studio-container w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="order-2 lg:order-1"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="flex items-center gap-3 mb-6"
                >
                  <img src={curatoLogoNew} alt="Curato" className="w-12 h-12 rounded-lg object-contain brightness-0 invert" />
                  <span className="text-muted-foreground uppercase tracking-[0.3em] text-sm">
                    Community-Driven Curation
                  </span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="hero-title mb-8"
                >
                  CURATO
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                  className="text-lg text-muted-foreground mb-10 max-w-md"
                >
                  Where the crowd surfaces talent and the experts validate it. A community-driven curation system for music across every genre.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9, duration: 0.6 }}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <Link to="/discover">
                    <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 px-8">
                      <TrendingUp className="mr-2" size={18} />
                      Explore Tracks
                    </Button>
                  </Link>
                  <Link to="/reviews">
                    <Button size="lg" variant="outline" className="px-8 border-foreground/20">
                      <Upload className="mr-2" size={18} />
                      Submit Music
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="order-1 lg:order-2"
              >
                <HeroCarousel />
              </motion.div>
            </div>
          </div>
        </section>

        {/* How It Works — The Waze Flow */}
        <section className="py-24 bg-card/50">
          <div className="studio-container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Community finds the talent. Curators confirm it. The best rises to the top.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {howItWorksSteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="p-8 bg-card rounded-xl border border-border hover:border-foreground/20 transition-all text-center"
                >
                  <div className="w-14 h-14 bg-foreground/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <step.icon size={24} className="text-foreground" />
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">Step {index + 1}</div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* The Curation Stack */}
        <section className="py-24">
          <div className="studio-container">
            <div className="grid lg:grid-cols-2 gap-16 items-start">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  The Signal<br />System
                </h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    Curato is not a judging panel — it's a signal system. The community generates 
                    data through engagement. The system filters it. Trusted curators validate it.
                  </p>
                  <p>
                    This means thousands of submissions with minimal cost. Only the best rises. 
                    Creators compete harder. The community feels involved.
                  </p>
                  <p className="font-semibold text-foreground">
                    "We're building a community-driven curation system — where the crowd surfaces talent and the experts validate it."
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-4"
              >
                {layers.map((layer, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.15 }}
                    className="p-6 bg-card rounded-xl border border-border hover:border-foreground/20 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-foreground/10 shrink-0">
                        <layer.icon className="w-5 h-5 text-foreground" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold mb-1">{layer.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{layer.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* What This Unlocks */}
        <section className="py-24 bg-card/50">
          <div className="studio-container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4">What This Unlocks</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                A system that scales with culture, not cost
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { title: "Massive Scale", desc: "Thousands of submissions, minimal cost increase." },
                { title: "Lower Costs", desc: "Less manual review, less reliance on expensive curators." },
                { title: "Stronger Community", desc: "Users feel involved. Creators compete harder." },
                { title: "Better Content", desc: "Only the best rises to the top." },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="p-8 bg-card rounded-xl border border-border hover:border-foreground/20 transition-all text-center"
                >
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="studio-container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h2 className="text-4xl md:text-6xl font-bold mb-6">
                The Community Finds<br />The Talent
              </h2>
              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                Curato works when the community surfaces talent — and the curators confirm it
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/discover">
                  <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 px-10">
                    Discover Tracks
                    <ArrowRight className="ml-2" size={18} />
                  </Button>
                </Link>
                <Link to="/leaderboard">
                  <Button size="lg" variant="outline" className="px-10 border-foreground/20">
                    <Trophy className="mr-2" size={18} />
                    View Leaderboard
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
};

export default Home;
