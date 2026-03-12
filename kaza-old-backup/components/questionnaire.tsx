'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Wallet, Compass, Activity } from 'lucide-react';
import { TripPreferences } from '@/lib/types';

const INTERESTS = [
  'Beaches', 'Mountains', 'City/Culture', 'Food & Wine',
  'Adventure', 'Relaxation', 'Wildlife', 'History',
];

interface QuestionnaireProps {
  onComplete: (preferences: TripPreferences) => void;
  loading?: boolean;
}

export function Questionnaire({ onComplete, loading }: QuestionnaireProps) {
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState<TripPreferences>({
    budget: 5000,
    tripLength: 7,
    interests: [],
    activityLevel: 'medium',
    mustHaves: '',
    dateFlexibility: '3days',
  });

  const updatePreference = <K extends keyof TripPreferences>(
    key: K,
    value: TripPreferences[K]
  ) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  const toggleInterest = (interest: string) => {
    setPreferences((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm text-zinc-500 mb-2">
          <span>Step {step} of 3</span>
          <span>{Math.round((step / 3) * 100)}% complete</span>
        </div>
        <div className="w-full bg-zinc-200 rounded-full h-2">
          <div
            className="bg-zinc-900 rounded-full h-2 transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              What&apos;s your budget?
            </CardTitle>
            <CardDescription>We&apos;ll find destinations that fit your budget</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="text-4xl font-bold text-center mb-4">
                ${preferences.budget.toLocaleString()}
              </div>
              <Slider
                value={[preferences.budget]}
                onValueChange={([v]) => updatePreference('budget', v)}
                min={2000}
                max={50000}
                step={1000}
              />
            </div>
            <div className="flex gap-2 justify-center">
              {[3000, 8000, 15000, 25000].map((b) => (
                <Button key={b} variant="outline" size="sm" onClick={() => updatePreference('budget', b)}>
                  ${b/1000}K
                </Button>
              ))}
            </div>
            <Button className="w-full" onClick={() => setStep(2)}>
              Continue
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Trip Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>Trip Length: {preferences.tripLength} days</Label>
              <Slider
                value={[preferences.tripLength]}
                onValueChange={([v]) => updatePreference('tripLength', v)}
                min={3}
                max={21}
                step={1}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="home">Home City (for flight costs)</Label>
              <Input
                id="home"
                placeholder="e.g., New York, London"
                value={preferences.homeCity || ''}
                onChange={(e) => updatePreference('homeCity', e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button className="flex-1" onClick={() => setStep(3)}>
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Compass className="w-5 h-5" />
              Your Travel Style
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="mb-2 block">What interests you?</Label>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map((interest) => (
                  <Badge
                    key={interest}
                    variant={preferences.interests.includes(interest) ? 'default' : 'outline'}
                    className="cursor-pointer px-3 py-1"
                    onClick={() => toggleInterest(interest)}
                  >
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Activity Level</Label>
              <div className="flex gap-2">
                {(['low', 'medium', 'high'] as const).map((level) => (
                  <Button
                    key={level}
                    variant={preferences.activityLevel === level ? 'default' : 'outline'}
                    className="flex-1 capitalize"
                    onClick={() => updatePreference('activityLevel', level)}
                  >
                    <Activity className="w-4 h-4 mr-1" />
                    {level}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="must-haves">Must-haves or special requests</Label>
              <Textarea
                id="must-haves"
                placeholder="e.g., Beachfront hotel, Walking tours, Vegetarian options..."
                value={preferences.mustHaves}
                onChange={(e) => updatePreference('mustHaves', e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button 
                className="flex-1" 
                onClick={() => onComplete(preferences)}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Find Destinations'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
