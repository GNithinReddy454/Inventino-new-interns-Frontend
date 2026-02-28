"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Heart, ShieldCheck, Leaf } from "lucide-react";

interface StatProps {
  label: string;
  value: string;
}

const StatCard: React.FC<StatProps> = ({ label, value }) => (
  <div className="bg-accent p-6 rounded-2xl text-center min-w-[140px] shadow-sm hover:shadow-md transition-shadow">
    <h3 className="text-2xl font-bold text-primary-dark">{value}</h3>
    <p className="text-muted-foreground text-sm font-medium">{label}</p>
  </div>
);

const AboutPage: React.FC = () => {
  const stats: StatProps[] = [
    { value: "10K+", label: "Happy Customers" },
    { value: "500+", label: "Unique Designs" },
    { value: "50+", label: "Skilled Artisans" },
  ];

  return (
    <div className="bg-card">
      {/* 1. HERO SECTION */}
      <section className="relative h-[60vh] flex items-center justify-center bg-background overflow-hidden border-b border-border">
        {/* NAVIGATION BUTTONS */}
        <div className="absolute top-8 left-8 right-8 flex justify-between items-center z-20">
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 bg-card/80 backdrop-blur-sm text-primary-dark rounded-full font-medium shadow-sm hover:bg-card hover:shadow-md transition-all border border-border"
          >
            <ArrowLeft size={18} />
            Back to Home
          </Link>

          <Link
            href="/products"
            className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-full font-medium shadow-md hover:bg-primary-dark transition-all"
          >
            Next to Shop
            <ArrowRight size={18} />
          </Link>
        </div>

        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(var(--color-primary)_1px,transparent_1px)] [background-size:20px_20px]"></div>
        </div>

        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-foreground mb-4">
            Crafted with <span className="text-primary-dark">Love</span>,<br />
            Designed for You
          </h1>
          <p className="max-w-xl mx-auto text-muted-foreground text-lg">
            Every piece we create is a blend of traditional craftsmanship and
            contemporary elegance.
          </p>
        </div>
      </section>

      {/* 2. STORY SECTION */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-foreground">
                More Than Just Products,
                <br />
                <span className="text-primary-dark">They're Memories</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Every piece in our collection is carefully handcrafted with
                passion and dedication. We believe that the items you wear and
                cherish should carry meaning, tell your story, and connect you
                to the artisans who made them.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                From the first sketch to the final polish, every step is a labor
                of love. We work with talented artisans who use techniques
                passed down through generations.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
              ))}
            </div>
          </div>

          <div className="flex-1 relative">
            <div className="rounded-[2rem] overflow-hidden shadow-2xl border-8 border-card">
              <img
                src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800"
                alt="Handcrafting jewelry"
                className="w-full h-[500px] object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-primary/20 rounded-full -z-10 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* 3. OUR VALUES SECTION */}
      <section className="bg-card py-20 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              What We Stand For
            </h2>
            <div className="w-20 h-1 bg-primary-dark mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-accent flex items-center justify-center rounded-2xl text-primary-dark">
                <Heart size={32} />
              </div>
              <h3 className="text-xl font-bold text-foreground">
                100% Handmade
              </h3>
              <p className="text-muted-foreground">
                No mass production. Every single item is hand-stitched or
                hand-assembled by our skilled team.
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-accent flex items-center justify-center rounded-2xl text-primary-dark">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-xl font-bold text-foreground">
                Quality Guaranteed
              </h3>
              <p className="text-muted-foreground">
                We use only the finest materials to ensure your jewelry remains
                a keepsake for years to come.
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-accent flex items-center justify-center rounded-2xl text-primary-dark">
                <Leaf size={32} />
              </div>
              <h3 className="text-xl font-bold text-foreground">
                Ethical Sourcing
              </h3>
              <p className="text-muted-foreground">
                We prioritize sustainability and fair wages for all the artisans
                in our network.
              </p>
            </div>
          </div>

          {/* FINAL CTA BUTTON */}
          <div className="mt-20 text-center">
            <Link
              href="/products"
              className="inline-flex items-center gap-3 px-10 py-4 bg-primary text-primary-foreground rounded-full font-bold text-lg shadow-xl shadow-pink-200 hover:bg-primary-dark hover:scale-105 transition-all"
            >
              Explore Our Shop
              <ArrowRight size={22} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
