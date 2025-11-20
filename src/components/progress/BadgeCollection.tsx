import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge as UIBadge } from "@/components/ui/badge";
import { Trophy, Award, Star, Shield } from "lucide-react";
import { Badge } from "@/types/progress";

interface BadgeCollectionProps {
  badges: Badge[];
}

export function BadgeCollection({ badges }: BadgeCollectionProps) {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common": return "border-gray-300 bg-gray-50";
      case "uncommon": return "border-green-300 bg-green-50";
      case "rare": return "border-blue-300 bg-blue-50";
      case "legendary": return "border-purple-300 bg-purple-50";
      default: return "border-gray-300 bg-gray-50";
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case "common": return <Award className="h-4 w-4" />;
      case "uncommon": return <Trophy className="h-4 w-4" />;
      case "rare": return <Star className="h-4 w-4" />;
      case "legendary": return <Shield className="h-4 w-4" />;
      default: return <Award className="h-4 w-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "skill": return "🎯";
      case "safety": return "🛡️";
      case "milestone": return "🏆";
      case "special": return "⭐";
      default: return "🎖️";
    }
  };

  const earnedBadges = badges.filter(badge => badge.dateEarned);
  const badgesByCategory = earnedBadges.reduce((acc, badge) => {
    if (!acc[badge.category]) acc[badge.category] = [];
    acc[badge.category].push(badge);
    return acc;
  }, {} as Record<string, Badge[]>);

  const badgeStats = {
    total: earnedBadges.length,
    common: earnedBadges.filter(b => b.rarity === "common").length,
    uncommon: earnedBadges.filter(b => b.rarity === "uncommon").length,
    rare: earnedBadges.filter(b => b.rarity === "rare").length,
    legendary: earnedBadges.filter(b => b.rarity === "legendary").length,
  };

  return (
    <div className="space-y-6">
      {/* Badge Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Badge Collection ({badgeStats.total} earned)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-3 border rounded-lg">
              <p className="text-2xl font-bold">{badgeStats.total}</p>
              <p className="text-sm text-muted-foreground">Total Badges</p>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <p className="text-2xl font-bold text-gray-600">{badgeStats.common}</p>
              <p className="text-sm text-muted-foreground">Common</p>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <p className="text-2xl font-bold text-green-600">{badgeStats.uncommon}</p>
              <p className="text-sm text-muted-foreground">Uncommon</p>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{badgeStats.rare}</p>
              <p className="text-sm text-muted-foreground">Rare</p>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{badgeStats.legendary}</p>
              <p className="text-sm text-muted-foreground">Legendary</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Badges by Category */}
      {Object.entries(badgesByCategory).map(([category, categoryBadges]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 capitalize">
              <span className="text-xl">{getCategoryIcon(category)}</span>
              {category} Badges ({categoryBadges.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryBadges.map(badge => (
                <div
                  key={badge.id}
                  className={`p-4 border-2 rounded-lg ${getRarityColor(badge.rarity)} hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-3xl">{badge.icon}</div>
                    <div className="flex items-center gap-1">
                      {getRarityIcon(badge.rarity)}
                      <UIBadge variant="outline" className="text-xs">
                        {badge.rarity}
                      </UIBadge>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold mb-1">{badge.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{badge.description}</p>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Earned: {badge.dateEarned}</span>
                    <UIBadge variant="secondary" className="text-xs">
                      {category}
                    </UIBadge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Available Badges (Not Yet Earned) */}
      {badges.filter(badge => !badge.dateEarned).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Available Badges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {badges
                .filter(badge => !badge.dateEarned)
                .map(badge => (
                  <div
                    key={badge.id}
                    className="p-4 border-2 border-dashed border-muted rounded-lg opacity-60 hover:opacity-80 transition-opacity"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-3xl grayscale">{badge.icon}</div>
                      <div className="flex items-center gap-1">
                        {getRarityIcon(badge.rarity)}
                        <UIBadge variant="outline" className="text-xs">
                          {badge.rarity}
                        </UIBadge>
                      </div>
                    </div>
                    
                    <h3 className="font-semibold mb-1">{badge.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{badge.description}</p>
                    
                    <UIBadge variant="secondary" className="text-xs">
                      {badge.category}
                    </UIBadge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}