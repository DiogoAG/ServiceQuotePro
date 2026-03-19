
"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Zap, BarChart3, Users, Wrench } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="font-bold text-xl tracking-tight text-primary">ServiceQuotePro</span>
          </div>
          <div className="flex gap-4">
            <Link href="/dashboard">
              <Button variant="outline">Log In</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-semibold mb-4">
            <Zap className="w-4 h-4" />
            Empowering Service Contractors
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-primary leading-tight">
            Professional Quotes <br /> <span className="text-accent">for Any Service</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            The all-in-one tool for service contractors to generate professional client quotes, manage business profiles, and win more jobs across any industry.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard">
              <Button size="lg" className="h-14 px-8 text-lg gap-2 shadow-xl">
                Get Started Now <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-primary/5 py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl font-bold">Built for Professionals</h2>
            <p className="text-muted-foreground max-xl mx-auto">Everything you need to run your service business quoting process efficiently.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <CardFeature 
              icon={<ShieldCheck className="w-8 h-8 text-primary" />}
              title="Business Profile"
              description="Configure your license, logo, and custom branding for every document."
            />
            <CardFeature 
              icon={<Zap className="w-8 h-8 text-accent" />}
              title="Detailed Work Scopes"
              description="Create professional work scope descriptions that clearly outline project objectives."
            />
            <CardFeature 
              icon={<BarChart3 className="w-8 h-8 text-primary" />}
              title="Smart Pricing"
              description="Automated labor, material, and tax calculations with real-time updates."
            />
            <CardFeature 
              icon={<ShieldCheck className="w-8 h-8 text-accent" />}
              title="Professional PDF"
              description="Export beautiful, client-ready PDF quotes directly from your browser."
            />
            <CardFeature 
              icon={<Users className="w-8 h-8 text-primary" />}
              title="Client CRM"
              description="Keep all your client contact details organized in one secure place."
            />
            <CardFeature 
              icon={<Wrench className="w-8 h-8 text-accent" />}
              title="Multi-Service Support"
              description="Tailor your quotes for Electrical, Plumbing, HVAC, Landscaping, and more."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="font-bold text-lg text-primary">ServiceQuotePro</span>
          </div>
          <div className="text-sm text-muted-foreground">
            © 2024 ServiceQuotePro. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm font-medium text-muted-foreground">
            <Link href="#" className="hover:text-primary">Terms</Link>
            <Link href="#" className="hover:text-primary">Privacy</Link>
            <Link href="#" className="hover:text-primary">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function CardFeature({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-card p-8 rounded-2xl shadow-sm border border-primary/5 hover:border-primary/20 transition-all hover:shadow-md">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
