import React from 'react';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { InfoIcon } from 'lucide-react';

const ShadcnDemo = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-citadelBlue">Citadel Academy UI Components</h1>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <Button>Default Button</Button>
          <Button variant="citadel">Citadel Button</Button>
          <Button variant="outline">Outline Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="destructive">Destructive Button</Button>
          <Button variant="ghost">Ghost Button</Button>
          <Button variant="link">Link Button</Button>
        </div>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
              <CardDescription>Details about the Bitcoin Basics course</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Learn the fundamentals of Bitcoin and how it works. This course covers everything from blockchain technology to setting up your first wallet.</p>
            </CardContent>
            <CardFooter>
              <Button variant="citadel">Enroll Now</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Family Learning</CardTitle>
              <CardDescription>Multi-generational knowledge preservation</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Create learning pathways for your entire family. Track progress and issue verifiable credentials that can't be censored or revoked.</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline">Learn More</Button>
            </CardFooter>
          </Card>
        </div>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Form Elements</h2>
        <Card>
          <CardHeader>
            <CardTitle>Sign Up for Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">First Name</label>
                  <Input placeholder="Enter your first name" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Name</label>
                  <Input placeholder="Enter your last name" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input type="email" placeholder="Enter your email" />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="citadel">Subscribe</Button>
          </CardFooter>
        </Card>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Badges</h2>
        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="citadel">Citadel</Badge>
        </div>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Alerts</h2>
        <div className="space-y-4">
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>Information</AlertTitle>
            <AlertDescription>
              This is a standard information alert.
            </AlertDescription>
          </Alert>
          
          <Alert variant="destructive">
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Something went wrong. Please try again.
            </AlertDescription>
          </Alert>
          
          <Alert variant="citadel">
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>Citadel Academy</AlertTitle>
            <AlertDescription>
              Welcome to the sovereign family learning platform.
            </AlertDescription>
          </Alert>
        </div>
      </section>
    </div>
  );
};

export default ShadcnDemo;