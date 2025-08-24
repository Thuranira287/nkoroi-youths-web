import React, { useState, useEffect } from "react";
import {
  Cross,
  Book,
  Star,
  Heart,
  Sun,
  ChevronDown,
  ChevronRight,
  Play,
  Clock,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface RosaryData {
  mysteries: Record<string, any[]>;
  prayers: Record<string, string>;
  ministryContent?: Record<string, any>;
}

interface Instructions {
  introduction: string;
  howToPray: string[];
  mysterySchedule: Record<string, string>;
  benefits: string[];
  ministryApplications?: Record<string, string>;
  scriptural_foundation?: Record<string, string>;
}

const HolyRosaryPage: React.FC = () => {
  const [rosaryData, setRosaryData] = useState<RosaryData | null>(null);
  const [instructions, setInstructions] = useState<Instructions | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedMystery, setExpandedMystery] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<string>("about");
  const [selectedMinistry, setSelectedMinistry] = useState<string>("");
  const [showScripture, setShowScripture] = useState(false);

  useEffect(() => {
    fetchRosaryData();
    fetchInstructions();

    // Set default tab based on current day
    const today = new Date().toLocaleDateString("en-US", {
      weekday: "long",
    });
    const mysteryTypes = ["joyful", "sorrowful", "glorious", "luminous"];

    // Simple day-to-mystery mapping
    const dayToMystery: Record<string, string> = {
      monday: "joyful",
      tuesday: "sorrowful",
      wednesday: "glorious",
      thursday: "luminous",
      friday: "sorrowful",
      saturday: "joyful",
      sunday: "glorious",
    };

    setSelectedTab(dayToMystery[today] || "joyful");
  }, []);

  const fetchRosaryData = async () => {
    try {
      const ministryParam = selectedMinistry
        ? `?ministry=${selectedMinistry}`
        : "";
      const response = await fetch(`/api/rosary${ministryParam}`);
      if (response.ok) {
        const data = await response.json();
        setRosaryData(data.data);
      }
    } catch (error) {
      console.error("Error fetching rosary data:", error);
    }
  };

  // Refetch data when ministry selection changes
  useEffect(() => {
    if (rosaryData) {
      fetchRosaryData();
    }
  }, [selectedMinistry]);

  const fetchInstructions = async () => {
    try {
      const response = await fetch("/api/rosary/instructions");
      if (response.ok) {
        const data = await response.json();
        setInstructions(data.data);
      }
    } catch (error) {
      console.error("Error fetching instructions:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMysteryIcon = (type: string) => {
    switch (type) {
      case "joyful":
        return <Star className="h-5 w-5 text-yellow-500" />;
      case "sorrowful":
        return <Cross className="h-5 w-5 text-red-500" />;
      case "glorious":
        return <Sun className="h-5 w-5 text-orange-500" />;
      case "luminous":
        return <Heart className="h-5 w-5 text-blue-500" />;
      default:
        return <Book className="h-5 w-5 text-gray-500" />;
    }
  };

  const getMysteryColor = (type: string) => {
    switch (type) {
      case "joyful":
        return "bg-yellow-50 border-yellow-200";
      case "sorrowful":
        return "bg-red-50 border-red-200";
      case "glorious":
        return "bg-orange-50 border-orange-200";
      case "luminous":
        return "bg-blue-50 border-blue-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getTodaysMystery = () => {
    if (!instructions) return null;
    const today = new Date().toLocaleDateString("en-US", {
      weekday: "long",
    });
    return instructions.mysterySchedule[today];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Holy Rosary...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-600 p-4 rounded-full">
              <Cross className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            The Holy Rosary
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Join us in prayer through the mysteries of Christ's life, guided by
            the intercession of Our Lady
          </p>
        </div>

        {/* Today's Mystery */}
        {instructions && (
          <Card className="mb-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl mb-2">
                    Today's Mystery
                  </CardTitle>
                  <div className="flex items-center text-blue-100">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>
                      {new Date().toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {getTodaysMystery()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-white/90 mb-4">
                Today we meditate on the {getTodaysMystery()} Mysteries. Take
                time to reflect on these sacred moments in the life of Christ
                and Mary.
              </p>
              <Button
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
                onClick={() =>
                  setSelectedTab(getTodaysMystery()?.toLowerCase() || "joyful")
                }
              >
                <Play className="h-4 w-4 mr-2" />
                Begin Prayer
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Ministry Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="h-5 w-5 mr-2 text-purple-600" />
              Ministry Focus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <Button
                variant={selectedMinistry === "" ? "default" : "outline"}
                onClick={() => setSelectedMinistry("")}
                className="text-sm"
              >
                General
              </Button>
              <Button
                variant={selectedMinistry === "youth" ? "default" : "outline"}
                onClick={() => setSelectedMinistry("youth")}
                className="text-sm"
              >
                Youth Ministry
              </Button>
              <Button
                variant={selectedMinistry === "family" ? "default" : "outline"}
                onClick={() => setSelectedMinistry("family")}
                className="text-sm"
              >
                Family Ministry
              </Button>
              <Button
                variant={
                  selectedMinistry === "suffering" ? "default" : "outline"
                }
                onClick={() => setSelectedMinistry("suffering")}
                className="text-sm"
              >
                Suffering Souls
              </Button>
              <Button
                variant={
                  selectedMinistry === "evangelization" ? "default" : "outline"
                }
                onClick={() => setSelectedMinistry("evangelization")}
                className="text-sm"
              >
                Evangelization
              </Button>
              <Button
                variant={selectedMinistry === "liturgy" ? "default" : "outline"}
                onClick={() => setSelectedMinistry("liturgy")}
                className="text-sm"
              >
                Liturgy Ministry
              </Button>
              <Button
                variant={
                  selectedMinistry === "contemplative" ? "default" : "outline"
                }
                onClick={() => setSelectedMinistry("contemplative")}
                className="text-sm"
              >
                Contemplative
              </Button>
            </div>

            {selectedMinistry &&
              rosaryData?.ministryContent?.[selectedMinistry] && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">
                    {rosaryData.ministryContent[selectedMinistry].focus}
                  </h4>
                  <p className="text-blue-800 text-sm italic mb-3">
                    "{rosaryData.ministryContent[selectedMinistry].scripture}"
                  </p>
                  <p className="text-blue-700 text-sm mb-3">
                    <strong>Intention:</strong>{" "}
                    {rosaryData.ministryContent[selectedMinistry].intention}
                  </p>
                  <div>
                    <strong className="text-blue-900 text-sm">
                      Prayer Practices:
                    </strong>
                    <ul className="list-disc list-inside text-blue-700 text-sm mt-1">
                      {rosaryData.ministryContent[
                        selectedMinistry
                      ].practices?.map((practice: string, index: number) => (
                        <li key={index}>{practice}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-6 mb-8">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="joyful">Joyful</TabsTrigger>
            <TabsTrigger value="sorrowful">Sorrowful</TabsTrigger>
            <TabsTrigger value="glorious">Glorious</TabsTrigger>
            <TabsTrigger value="luminous">Luminous</TabsTrigger>
            <TabsTrigger value="prayers">All Prayers</TabsTrigger>
          </TabsList>

          {/* About Tab */}
          <TabsContent value="about">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Book className="h-5 w-5 mr-2 text-blue-600" />
                    What is the Rosary?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {instructions?.introduction}
                  </p>

                  <h4 className="font-semibold text-gray-900 mb-3">
                    Benefits of Praying the Rosary:
                  </h4>
                  <ul className="space-y-2">
                    {instructions?.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start">
                        <div className="bg-blue-100 rounded-full p-1 mr-3 mt-1 flex-shrink-0">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                        </div>
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-green-600" />
                    How to Pray the Rosary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-3">
                    {instructions?.howToPray.map((step, index) => (
                      <li key={index} className="flex items-start">
                        <div className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 flex-shrink-0">
                          {index + 1}
                        </div>
                        <span className="text-gray-700">{step}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-purple-600" />
                      Weekly Mystery Schedule
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowScripture(!showScripture)}
                    >
                      {showScripture ? "Hide" : "Show"} Scripture References
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
                    {instructions &&
                      Object.entries(instructions.mysterySchedule).map(
                        ([day, mystery]) => (
                          <div
                            key={day}
                            className="text-center p-4 rounded-lg bg-gray-50 border"
                          >
                            <h4 className="font-semibold text-gray-900 capitalize mb-2">
                              {day}
                            </h4>
                            <Badge
                              variant="outline"
                              className="capitalize text-xs"
                            >
                              {mystery.split(" (")[0]}
                            </Badge>
                            {showScripture && mystery.includes("(") && (
                              <p className="text-xs text-gray-600 mt-2">
                                {mystery.split("(")[1]?.replace(")", "")}
                              </p>
                            )}
                          </div>
                        ),
                      )}
                  </div>

                  {/* Ministry Applications */}
                  {instructions?.ministryApplications && (
                    <div className="mt-8">
                      <h4 className="font-semibold text-gray-900 mb-4">
                        Ministry Applications
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(instructions.ministryApplications).map(
                          ([ministry, description]) => (
                            <div
                              key={ministry}
                              className="p-4 bg-blue-50 rounded-lg border border-blue-200"
                            >
                              <h5 className="font-medium text-blue-900 capitalize mb-2">
                                {ministry.replace("_", " ")} Ministry
                              </h5>
                              <p className="text-blue-800 text-sm">
                                {description}
                              </p>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Mystery Tabs */}
          {["joyful", "sorrowful", "glorious", "luminous"].map(
            (mysteryType) => (
              <TabsContent key={mysteryType} value={mysteryType}>
                <div className="space-y-6">
                  <Card className={getMysteryColor(mysteryType)}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between text-2xl">
                        <div className="flex items-center">
                          {getMysteryIcon(mysteryType)}
                          <span className="ml-3 capitalize">
                            {mysteryType} Mysteries
                          </span>
                        </div>
                        {selectedMinistry && (
                          <Badge variant="secondary" className="capitalize">
                            {selectedMinistry} Focus
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                        {rosaryData?.mysteries[mysteryType]?.map(
                          (mystery, index) => (
                            <Card
                              key={mystery.id}
                              className="hover:shadow-md transition-shadow cursor-pointer"
                              onClick={() =>
                                setExpandedMystery(
                                  expandedMystery === mystery.id
                                    ? null
                                    : mystery.id,
                                )
                              }
                            >
                              <CardContent className="p-4">
                                <div className="text-center">
                                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3">
                                    {index + 1}
                                  </div>
                                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                                    {mystery.title}
                                  </h4>
                                  <p className="text-xs text-gray-600 line-clamp-3">
                                    {mystery.mysteries[0].split(".")[0]}.
                                  </p>
                                  {expandedMystery === mystery.id && (
                                    <div className="mt-3 pt-3 border-t">
                                      <p className="text-xs text-gray-700 text-left">
                                        {mystery.mysteries[0]}
                                      </p>
                                      {instructions?.scriptural_foundation && (
                                        <div className="mt-2 p-2 bg-blue-50 rounded">
                                          <p className="text-xs font-medium text-blue-900">
                                            Scripture:
                                          </p>
                                          <p className="text-xs text-blue-800">
                                            {getScriptureReference(
                                              mystery.title,
                                              instructions.scriptural_foundation,
                                            )}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ),
                        )}
                      </div>

                      {/* Ministry-specific prayer for this mystery type */}
                      {selectedMinistry &&
                        rosaryData?.prayers?.[
                          `${selectedMinistry}MinistryPrayer`
                        ] && (
                          <Card className="bg-purple-50 border-purple-200">
                            <CardHeader>
                              <CardTitle className="text-lg text-purple-900">
                                Special Prayer for{" "}
                                {selectedMinistry.charAt(0).toUpperCase() +
                                  selectedMinistry.slice(1)}{" "}
                                Ministry
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-purple-800 italic leading-relaxed">
                                {
                                  rosaryData.prayers[
                                    `${selectedMinistry}MinistryPrayer`
                                  ]
                                }
                              </p>
                            </CardContent>
                          </Card>
                        )}
                    </CardContent>
                  </Card>

                  {/* Essential Prayers for this Mystery Type */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Book className="h-5 w-5 mr-2 text-gray-600" />
                        Essential Rosary Prayers
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {rosaryData &&
                          Object.entries(rosaryData.prayers)
                            .filter(([key]) =>
                              [
                                "ourFather",
                                "hailMary",
                                "gloryBe",
                                "fatimaPrayer",
                              ].includes(key),
                            )
                            .map(([key, prayer]) => (
                              <Collapsible key={key}>
                                <CollapsibleTrigger className="w-full">
                                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <h4 className="font-semibold text-gray-900">
                                      {key
                                        .replace(/([A-Z])/g, " $1")
                                        .replace(/^./, (str) =>
                                          str.toUpperCase(),
                                        )
                                        .trim()}
                                    </h4>
                                    <ChevronDown className="h-4 w-4 text-gray-500" />
                                  </div>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  <div className="p-4 bg-white border border-gray-200 rounded-b-lg">
                                    <p className="text-gray-700 leading-relaxed italic">
                                      {prayer}
                                    </p>
                                  </div>
                                </CollapsibleContent>
                              </Collapsible>
                            ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            ),
          )}

          {/* All Prayers Tab */}
          <TabsContent value="prayers">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Book className="h-5 w-5 mr-2 text-gray-600" />
                    Complete Rosary Prayers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Essential Prayers */}
                    <div>
                      <h3 className="font-semibold text-lg mb-4 text-gray-900">
                        Essential Prayers
                      </h3>
                      <div className="space-y-4">
                        {rosaryData &&
                          Object.entries(rosaryData.prayers)
                            .filter(([key]) =>
                              [
                                "signOfCross",
                                "apostlesCreed",
                                "ourFather",
                                "hailMary",
                                "gloryBe",
                                "fatimaPrayer",
                                "hailHolyQueen",
                              ].includes(key),
                            )
                            .map(([key, prayer]) => (
                              <Collapsible key={key}>
                                <CollapsibleTrigger className="w-full">
                                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left">
                                    <h4 className="font-semibold text-gray-900">
                                      {key
                                        .replace(/([A-Z])/g, " $1")
                                        .replace(/^./, (str) =>
                                          str.toUpperCase(),
                                        )
                                        .trim()}
                                    </h4>
                                    <ChevronDown className="h-4 w-4 text-gray-500" />
                                  </div>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  <div className="p-4 bg-white border border-gray-200 rounded-b-lg">
                                    <p className="text-gray-700 leading-relaxed italic">
                                      {prayer}
                                    </p>
                                  </div>
                                </CollapsibleContent>
                              </Collapsible>
                            ))}
                      </div>
                    </div>

                    {/* Ministry Prayers */}
                    <div>
                      <h3 className="font-semibold text-lg mb-4 text-gray-900">
                        Ministry-Specific Prayers
                      </h3>
                      <div className="space-y-4">
                        {rosaryData &&
                          Object.entries(rosaryData.prayers)
                            .filter(([key]) => key.includes("MinistryPrayer"))
                            .map(([key, prayer]) => (
                              <Collapsible key={key}>
                                <CollapsibleTrigger className="w-full">
                                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left">
                                    <h4 className="font-semibold text-blue-900">
                                      {key
                                        .replace("MinistryPrayer", "")
                                        .replace(/([A-Z])/g, " $1")
                                        .trim()}{" "}
                                      Ministry
                                    </h4>
                                    <ChevronDown className="h-4 w-4 text-blue-500" />
                                  </div>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  <div className="p-4 bg-white border border-blue-200 rounded-b-lg">
                                    <p className="text-blue-700 leading-relaxed italic">
                                      {prayer}
                                    </p>
                                  </div>
                                </CollapsibleContent>
                              </Collapsible>
                            ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Helper function to get scripture reference for a mystery
const getScriptureReference = (
  mysteryTitle: string,
  scriptureFoundation: Record<string, string>,
): string => {
  const mysteryMap: Record<string, string> = {
    "The Annunciation": "annunciation",
    "The Visitation": "visitation",
    "The Nativity": "nativity",
    "The Presentation": "presentation",
    "Finding Jesus in the Temple": "finding_temple",
    "The Agony in the Garden": "agony_garden",
    "The Scourging at the Pillar": "scourging",
    "The Crowning with Thorns": "crowning_thorns",
    "The Carrying of the Cross": "carrying_cross",
    "The Crucifixion": "crucifixion",
    "The Resurrection": "resurrection",
    "The Ascension": "ascension",
    "The Descent of the Holy Spirit": "pentecost",
    "The Assumption of Mary": "assumption",
    "The Coronation of Mary": "coronation",
    "The Baptism of Jesus": "baptism_jordan",
    "The Wedding at Cana": "wedding_cana",
    "The Proclamation of the Kingdom": "proclamation",
    "The Transfiguration": "transfiguration",
    "The Institution of the Eucharist": "eucharist",
  };

  const key = mysteryMap[mysteryTitle];
  return key ? scriptureFoundation[key] || "" : "";
};

export default HolyRosaryPage;
