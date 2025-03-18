'use client';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from '@/lib/db/schema';

export function Settings({ user }: { user: User }) {
  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium mb-6">Account Settings</h1>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={`/placeholder.svg?height=32&width=32`} alt={user.name || ''} />
              <AvatarFallback>
                {user.name?.split(' ').map((n) => n[0]).join('') || user.email[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user.name || 'No name set'}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Your Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">You are currently on the free plan.</p>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white">
            Upgrade to Pro
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
