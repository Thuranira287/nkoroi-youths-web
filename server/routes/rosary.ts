import { RequestHandler } from "express";
import { RosaryMystery } from "@shared/api";
import { getDatabase } from "../database/db";

export const handleGetRosaryMysteries: RequestHandler = async (req, res) => {
  try {
    const { type, ministry } = req.query;
    const db = await getDatabase();

    let query = "SELECT * FROM rosary_mysteries";
    let params: any[] = [];

    if (
      type &&
      ["joyful", "sorrowful", "glorious", "luminous"].includes(type as string)
    ) {
      query += " WHERE type = ?";
      params.push(type);
    }

    query += " ORDER BY type, mystery_order";

    const mysteries = await db.all(query, ...params);

    const formattedMysteries: RosaryMystery[] = mysteries.map((mystery) => ({
      id: mystery.id.toString(),
      type: mystery.type,
      title: mystery.title,
      mysteries: [mystery.description], // Enhanced description with ministry focus
      prayers: [], // Prayers will be added separately
    }));

    // Group mysteries by type
    const groupedMysteries: Record<string, RosaryMystery[]> = {};
    formattedMysteries.forEach((mystery) => {
      if (!groupedMysteries[mystery.type]) {
        groupedMysteries[mystery.type] = [];
      }
      groupedMysteries[mystery.type].push(mystery);
    });

    // Enhanced prayers with ministry-specific variations
    const commonPrayers = {
      signOfCross:
        "In the name of the Father, and of the Son, and of the Holy Spirit. Amen.",
      apostlesCreed:
        "I believe in God, the Father almighty, Creator of heaven and earth, and in Jesus Christ, his only Son, our Lord, who was conceived by the Holy Spirit, born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died and was buried; he descended into hell; on the third day he rose again from the dead; he ascended into heaven, and is seated at the right hand of God the Father almighty; from there he will come to judge the living and the dead. I believe in the Holy Spirit, the holy catholic Church, the communion of saints, the forgiveness of sins, the resurrection of the body, and life everlasting. Amen.",
      ourFather:
        "Our Father, who art in heaven, hallowed be thy name; thy kingdom come; thy will be done on earth as it is in heaven. Give us this day our daily bread; and forgive us our trespasses as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen.",
      hailMary:
        "Hail Mary, full of grace, the Lord is with thee; blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.",
      gloryBe:
        "Glory be to the Father, and to the Son, and to the Holy Spirit. As it was in the beginning, is now, and ever shall be, world without end. Amen.",
      fatimaPrayer:
        "O my Jesus, forgive us our sins, save us from the fires of hell, lead all souls to Heaven, especially those most in need of Thy mercy.",
      hailHolyQueen:
        "Hail, holy Queen, Mother of mercy, our life, our sweetness and our hope. To thee do we cry, poor banished children of Eve. To thee do we send up our sighs, mourning and weeping in this valley of tears. Turn then, most gracious advocate, thine eyes of mercy toward us, and after this our exile, show unto us the blessed fruit of thy womb, Jesus. O clement, O loving, O sweet Virgin Mary! Pray for us, O holy Mother of God, that we may be made worthy of the promises of Christ.",

      // Ministry-specific prayers
      youthMinistryPrayer:
        "O Mary, Mother of Youth, guide our young people as they grow in faith and wisdom. Help them to follow your example of saying 'yes' to God's will. Protect them from the temptations of the world and strengthen them to be witnesses of Christ's love. Through your intercession, may they find their calling and serve God with generous hearts. Amen.",

      familyMinistryPrayer:
        "Holy Family of Nazareth, Jesus, Mary, and Joseph, bless all families in our parish. Help parents to be faithful examples of Christian love, and may children grow in grace and wisdom. Heal broken relationships, comfort those who mourn, and strengthen the bonds of love that unite families. May every home be a domestic church where prayer and peace reign. Amen.",

      sufferingMinistryPrayer:
        "Mary, Mother of Sorrows, you stood by the cross and watched your Son suffer and die. Be with all who are suffering today - the sick, the dying, the grieving, and the lonely. Comfort them with your maternal love and help them to unite their sufferings with those of Christ. Give them hope in their darkest moments and the grace to find meaning in their pain. Amen.",

      evangelizationPrayer:
        "Mary, Star of Evangelization, you brought Christ to Elizabeth and to all generations. Help us to proclaim the Gospel with joy and courage. Open hearts to receive the Good News and strengthen our witness in word and deed. May we, like you, magnify the Lord in all we do and say. Give us the grace to be instruments of God's mercy and love in our world. Amen.",

      liturgyMinistryPrayer:
        "Mary, Mother of the Eucharist, you were present at the wedding feast of Cana and the Last Supper. Help all who serve in liturgical ministries to worship with reverence and joy. May our celebration of the sacraments be a source of grace and transformation. Guide lectors, musicians, and ministers to serve with humility and love. Through your intercession, may all who gather for worship encounter the risen Christ. Amen.",

      charismaticPrayer:
        "Mary, Spouse of the Holy Spirit, you were filled with God's Spirit at the Annunciation and present at Pentecost when the Spirit descended upon the apostles. Open our hearts to receive the gifts and fruits of the Holy Spirit. Help us to pray with fervor, to praise with joy, and to serve with love. May we be docile to the Spirit's promptings and bold in proclaiming the mighty works of God. Amen.",

      socialJusticePrayer:
        "Mary, Mother of the Poor, you sang of God lifting up the lowly and filling the hungry with good things. Inspire us to work for justice and peace in our world. Help us to see Christ in the poor, the marginalized, and the oppressed. Give us courage to speak for those who have no voice and to act with compassion toward all in need. May we build a more just and loving world. Amen.",

      contemplativePrayer:
        "Mary, Queen of Peace, you pondered all things in your heart and lived in perfect union with God's will. Teach us to be still and know that God is God. In the silence of prayer, help us to listen for God's voice and to rest in divine love. May our contemplation bear fruit in action, and may our action flow from deep prayer. Grant us the grace to live in constant awareness of God's presence. Amen.",
    };

    // Get ministry-specific content based on query parameter
    const ministryContent = getMinistrySpecificContent(ministry as string);

    res.json({
      success: true,
      data: {
        mysteries: groupedMysteries,
        prayers: commonPrayers,
        ministryContent,
      },
    });
  } catch (error) {
    console.error("Get rosary mysteries error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving rosary mysteries",
    });
  }
};

function getMinistrySpecificContent(ministry?: string) {
  const ministryContent: Record<string, any> = {
    youth: {
      focus: "Growing in Faith and Vocation",
      scripture:
        "Before I formed you in the womb I knew you, before you were born I set you apart. - Jeremiah 1:5",
      intention:
        "For young people to discover their calling and grow in holiness",
      practices: [
        "Pray for discernment of God's will",
        "Meditate on Mary's 'yes' to God",
        "Ask for courage to follow Christ",
        "Pray for purity and wisdom",
        "Seek guidance in life decisions",
      ],
    },
    family: {
      focus: "Unity and Love in the Domestic Church",
      scripture:
        "As for me and my household, we will serve the Lord. - Joshua 24:15",
      intention: "For families to grow in love and be witnesses of faith",
      practices: [
        "Pray for family unity and peace",
        "Meditate on the Holy Family",
        "Ask for patience and understanding",
        "Pray for protection of children",
        "Seek blessing on family relationships",
      ],
    },
    suffering: {
      focus: "Finding Hope in Times of Trial",
      scripture:
        "Come to me, all you who are weary and burdened, and I will give you rest. - Matthew 11:28",
      intention: "For comfort and healing for all who suffer",
      practices: [
        "Unite sufferings with Christ's passion",
        "Meditate on Mary's sorrows",
        "Ask for strength to endure",
        "Pray for healing and peace",
        "Offer sufferings for others",
      ],
    },
    evangelization: {
      focus: "Spreading the Good News with Joy",
      scripture: "Go and make disciples of all nations. - Matthew 28:19",
      intention: "For the spread of the Gospel and conversion of hearts",
      practices: [
        "Pray for courage to witness",
        "Meditate on Christ's mission",
        "Ask for open hearts to receive the Gospel",
        "Pray for missionaries worldwide",
        "Seek opportunities to share faith",
      ],
    },
    liturgy: {
      focus: "Worship in Spirit and Truth",
      scripture: "Do this in memory of me. - Luke 22:19",
      intention: "For reverent and fruitful liturgical celebrations",
      practices: [
        "Pray for deeper understanding of the Mass",
        "Meditate on the Eucharistic mysteries",
        "Ask for reverence in worship",
        "Pray for priests and liturgical ministers",
        "Seek grace through the sacraments",
      ],
    },
    contemplative: {
      focus: "Dwelling in God's Presence",
      scripture: "Be still and know that I am God. - Psalm 46:10",
      intention: "For growth in contemplative prayer and union with God",
      practices: [
        "Practice silent meditation",
        "Meditate on Scripture passages",
        "Ask for the grace of contemplation",
        "Pray for deeper intimacy with God",
        "Seek to live in God's presence",
      ],
    },
  };

  return ministry ? ministryContent[ministry] : ministryContent;
}

export const handleGetMysteryInstructions: RequestHandler = async (
  req,
  res,
) => {
  try {
    const instructions = {
      introduction:
        "The Holy Rosary is a Scripture-based prayer that begins with the Apostles' Creed, which summarizes the great mysteries of the Catholic faith. The Our Father, which introduces each mystery, is from the Gospels. The first part of the Hail Mary is the angel's words announcing Christ's birth and Elizabeth's greeting to Mary. St. Pius V officially added the second part of the Hail Mary. The Glory Be is doxology (glory to God) that has been used by Christians since the fourth century. The Rosary is a powerful tool for different ministries in the Church, each finding special meaning in the mysteries.",

      howToPray: [
        "Begin with the Sign of the Cross",
        "Recite the Apostles' Creed while holding the crucifix",
        "Say the Our Father on the first large bead",
        "Say three Hail Marys on the next three small beads (for faith, hope, and charity)",
        "Say the Glory Be, then announce the first Mystery",
        "Say the Our Father on the large bead before each decade",
        "Say ten Hail Marys on the small beads while meditating on the Mystery",
        "Say the Glory Be after each decade",
        "Say the Fatima Prayer after the Glory Be (optional but recommended)",
        "Repeat steps 6-9 for each of the five Mysteries",
        "Conclude with the Hail Holy Queen and any personal prayers",
        "End with the Sign of the Cross and a prayer for the Pope's intentions",
      ],

      mysterySchedule: {
        monday: "Joyful Mysteries (Focus: New beginnings, hope, family life)",
        tuesday:
          "Sorrowful Mysteries (Focus: Suffering, redemption, sacrifice)",
        wednesday:
          "Glorious Mysteries (Focus: Victory, resurrection, eternal life)",
        thursday:
          "Luminous Mysteries (Focus: Christ's public ministry, sacraments)",
        friday: "Sorrowful Mysteries (Focus: Good Friday, passion, atonement)",
        saturday:
          "Joyful Mysteries (Focus: Marian devotion, preparation for Sunday)",
        sunday: "Glorious Mysteries (Focus: Resurrection, church community)",
      },

      benefits: [
        "Deepens meditation on the life of Christ through Mary's eyes",
        "Strengthens prayer life and devotion to the Blessed Mother",
        "Provides peace and spiritual comfort in all circumstances",
        "Helps in times of difficulty, trial, and decision-making",
        "Unites us with the universal Church in prayer across all cultures",
        "Develops contemplative prayer and scriptural meditation",
        "Offers structure for both personal and communal prayer",
        "Connects different parish ministries through shared devotion",
        "Provides spiritual protection and intercession through Mary",
        "Cultivates virtues modeled by Christ and Mary",
      ],

      ministryApplications: {
        youth:
          "Young people find in Mary a model of discipleship and trust in God's plan. The Joyful Mysteries especially speak to youth about saying 'yes' to God's call.",
        family:
          "Families pray the Rosary together to strengthen bonds and seek Mary's intercession for family harmony. The Holy Family provides a perfect model.",
        suffering:
          "Those experiencing illness, loss, or trials find comfort in the Sorrowful Mysteries, uniting their sufferings with Christ's passion.",
        evangelization:
          "Missionaries and evangelizers draw strength from the Glorious Mysteries, celebrating Christ's victory and the Church's mission.",
        liturgy:
          "Liturgical ministers prepare for Mass through the Luminous Mysteries, reflecting on Christ's sacramental presence.",
        contemplative:
          "Those called to deeper prayer life use the Rosary as a gateway to contemplative meditation on Christ's mysteries.",
        social_justice:
          "Advocates for justice meditate on Mary's Magnificat and Christ's preferential option for the poor through all mysteries.",
        pastoral_care:
          "Those ministering to others find in Mary a model of compassionate presence and intercession for those in need.",
      },

      scriptural_foundation: {
        annunciation: "Luke 1:26-38",
        visitation: "Luke 1:39-56",
        nativity: "Luke 2:1-20",
        presentation: "Luke 2:22-40",
        finding_temple: "Luke 2:41-52",
        agony_garden: "Matthew 26:36-46",
        scourging: "John 19:1",
        crowning_thorns: "Matthew 27:27-31",
        carrying_cross: "John 19:17",
        crucifixion: "John 19:18-30",
        resurrection: "Matthew 28:1-10",
        ascension: "Acts 1:6-11",
        pentecost: "Acts 2:1-31",
        assumption: "Revelation 12:1",
        coronation: "Revelation 12:1-17",
        baptism_jordan: "Matthew 3:13-17",
        wedding_cana: "John 2:1-11",
        proclamation: "Mark 1:14-15",
        transfiguration: "Matthew 17:1-8",
        eucharist: "Matthew 26:26-29",
      },
    };

    res.json({
      success: true,
      data: instructions,
    });
  } catch (error) {
    console.error("Get mystery instructions error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving mystery instructions",
    });
  }
};
