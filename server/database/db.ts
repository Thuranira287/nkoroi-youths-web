import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import path from "path";
import fs from "fs";
import crypto from "crypto";

let db: Database<sqlite3.Database, sqlite3.Statement> | null = null;

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function initDatabase(): Promise<
  Database<sqlite3.Database, sqlite3.Statement>
> {
  if (db) {
    return db;
  }

  const dbPath = path.join(process.cwd(), "server", "database", "stbhakita.db");

  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });


  await db.exec("PRAGMA foreign_keys = ON");

  const schemaPath = path.join(
    process.cwd(),
    "server",
    "database",
    "schema.sql",
  );
  const schema = fs.readFileSync(schemaPath, "utf8");
  await db.exec(schema);

  console.log("Database initialized successfully");

  await seedInitialData();

  return db;
}

export async function getDatabase(): Promise<
  Database<sqlite3.Database, sqlite3.Statement>
> {
  if (!db) {
    return await initDatabase();
  }
  return db;
}

async function seedInitialData() {
  if (!db) return;

  const adminExists = await db.get(
    "SELECT id FROM users WHERE email = ?",
    "admin@stbhakita.org",
  );

  if (!adminExists) {
    // Create default admin user (password: admin123)
    await db.run(
      `
      INSERT INTO users (username, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `,
      "admin",
      "admin@stbhakita.org",
      hashPassword("admin123"),
      "admin",
    );

    // Create default regular user (password: user123)
    await db.run(
      `
      INSERT INTO users (username, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `,
      "member",
      "user@stbhakita.org",
      hashPassword("user123"),
      "user",
    );

    console.log("Default users created");
  }

  // daily quotes
  const quotesExist = await db.get("SELECT id FROM daily_quotes LIMIT 1");
  if (!quotesExist) {
    await seedDailyQuotes();
  }

  // Bible books
  const booksExist = await db.get("SELECT id FROM bible_books LIMIT 1");
  if (!booksExist) {
    await seedBibleBooks();
    await seedSampleVerses();
  }

  // Rosary mysteries
  const mysteriesExist = await db.get(
    "SELECT id FROM rosary_mysteries LIMIT 1",
  );
  if (!mysteriesExist) {
    await seedRosaryMysteries();
  }

  // sample announcements
  const announcementsExist = await db.get(
    "SELECT id FROM announcements LIMIT 1",
  );
  if (!announcementsExist) {
    await seedSampleAnnouncements();
  }

  // sample trip albums
  const albumsExist = await db.get("SELECT id FROM trip_albums LIMIT 1");
  if (!albumsExist) {
    await seedSampleTripAlbums();
  }

  // sample Sunday readings
  const readingsExist = await db.get("SELECT id FROM sunday_readings LIMIT 1");
  if (!readingsExist) {
    await seedSampleSundayReadings();
  }
}

async function seedDailyQuotes() {
  if (!db) return;

  const quotes = [
    {
      verse:
        "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, to give you hope and a future.",
      reference: "Jeremiah 29:11",
      dateIndex: 1,
    },
    {
      verse:
        "Trust in the Lord with all your heart and lean not on your own understanding.",
      reference: "Proverbs 3:5",
      dateIndex: 2,
    },
    {
      verse: "I can do all things through Christ who strengthens me.",
      reference: "Philippians 4:13",
      dateIndex: 3,
    },
    {
      verse:
        "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.",
      reference: "Joshua 1:9",
      dateIndex: 4,
    },
    {
      verse:
        "The Lord your God is with you, the Mighty Warrior who saves. He will take great delight in you; in his love he will no longer rebuke you, but will rejoice over you with singing.",
      reference: "Zephaniah 3:17",
      dateIndex: 5,
    },
    {
      verse:
        "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.",
      reference: "Romans 8:28",
      dateIndex: 6,
    },
    {
      verse:
        "But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.",
      reference: "Isaiah 40:31",
      dateIndex: 7,
    },
    {
      verse:
        "The Lord is my shepherd, I lack nothing. He makes me lie down in green pastures, he leads me beside quiet waters, he refreshes my soul.",
      reference: "Psalm 23:1-3",
      dateIndex: 8,
    },
    {
      verse: "Cast all your anxiety on him because he cares for you.",
      reference: "1 Peter 5:7",
      dateIndex: 9,
    },
    {
      verse:
        "This is the day the Lord has made; let us rejoice and be glad in it.",
      reference: "Psalm 118:24",
      dateIndex: 10,
    },
    {
      verse:
        "Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid.",
      reference: "John 14:27",
      dateIndex: 11,
    },
    {
      verse:
        "The Lord bless you and keep you; the Lord make his face shine on you and be gracious to you.",
      reference: "Numbers 6:24-25",
      dateIndex: 12,
    },
    {
      verse:
        "Come to me, all you who are weary and burdened, and I will give you rest.",
      reference: "Matthew 11:28",
      dateIndex: 13,
    },
    {
      verse:
        "Love is patient, love is kind. It does not envy, it does not boast, it is not proud.",
      reference: "1 Corinthians 13:4",
      dateIndex: 14,
    },
    {
      verse:
        "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",
      reference: "John 3:16",
      dateIndex: 15,
    },
    {
      verse:
        "In their hearts humans plan their course, but the Lord establishes their steps.",
      reference: "Proverbs 16:9",
      dateIndex: 16,
    },
    {
      verse:
        "The grass withers and the flowers fall, but the word of our God endures forever.",
      reference: "Isaiah 40:8",
      dateIndex: 17,
    },
    {
      verse:
        "Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!",
      reference: "2 Corinthians 5:17",
      dateIndex: 18,
    },
    {
      verse:
        "Let your light shine before others, that they may see your good deeds and glorify your Father in heaven.",
      reference: "Matthew 5:16",
      dateIndex: 19,
    },
    {
      verse: "Be joyful in hope, patient in affliction, faithful in prayer.",
      reference: "Romans 12:12",
      dateIndex: 20,
    },
    {
      verse:
        "The Lord your God is in your midst, a mighty one who will save; he will rejoice over you with gladness; he will quiet you by his love.",
      reference: "Zephaniah 3:17",
      dateIndex: 21,
    },
    {
      verse:
        "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.",
      reference: "Philippians 4:6",
      dateIndex: 22,
    },
    {
      verse:
        "He gives strength to the weary and increases the power of the weak.",
      reference: "Isaiah 40:29",
      dateIndex: 23,
    },
    {
      verse: "The Lord will fight for you; you need only to be still.",
      reference: "Exodus 14:14",
      dateIndex: 24,
    },
    {
      verse:
        "Above all else, guard your heart, for everything you do flows from it.",
      reference: "Proverbs 4:23",
      dateIndex: 25,
    },
    {
      verse:
        "Delight yourself in the Lord, and he will give you the desires of your heart.",
      reference: "Psalm 37:4",
      dateIndex: 26,
    },
    {
      verse:
        "Many are the plans in a person's heart, but it is the Lord's purpose that prevails.",
      reference: "Proverbs 19:21",
      dateIndex: 27,
    },
    {
      verse:
        "The name of the Lord is a fortified tower; the righteous run to it and are safe.",
      reference: "Proverbs 18:10",
      dateIndex: 28,
    },
    {
      verse:
        "Commit to the Lord whatever you do, and he will establish your plans.",
      reference: "Proverbs 16:3",
      dateIndex: 29,
    },
    {
      verse:
        "The Lord is close to the brokenhearted and saves those who are crushed in spirit.",
      reference: "Psalm 34:18",
      dateIndex: 30,
    },
    {
      verse: "Rejoice in the Lord always. I will say it again: Rejoice!",
      reference: "Philippians 4:4",
      dateIndex: 31,
    },
  ];

  for (const quote of quotes) {
    await db.run(
      "INSERT INTO daily_quotes (verse, reference, date_index) VALUES (?, ?, ?)",
      quote.verse,
      quote.reference,
      quote.dateIndex,
    );
  }

  console.log("Daily quotes seeded");
}

async function seedBibleBooks() {
  if (!db) return;

  const oldTestamentBooks = [
    "Genesis",
    "Exodus",
    "Leviticus",
    "Numbers",
    "Deuteronomy",
    "Joshua",
    "Judges",
    "Ruth",
    "1 Samuel",
    "2 Samuel",
    "1 Kings",
    "2 Kings",
    "1 Chronicles",
    "2 Chronicles",
    "Ezra",
    "Nehemiah",
    "Esther",
    "Job",
    "Psalms",
    "Proverbs",
    "Ecclesiastes",
    "Song of Songs",
    "Isaiah",
    "Jeremiah",
    "Lamentations",
    "Ezekiel",
    "Daniel",
    "Hosea",
    "Joel",
    "Amos",
    "Obadiah",
    "Jonah",
    "Micah",
    "Nahum",
    "Habakkuk",
    "Zephaniah",
    "Haggai",
    "Zechariah",
    "Malachi",
  ];

  const newTestamentBooks = [
    "Matthew",
    "Mark",
    "Luke",
    "John",
    "Acts",
    "Romans",
    "1 Corinthians",
    "2 Corinthians",
    "Galatians",
    "Ephesians",
    "Philippians",
    "Colossians",
    "1 Thessalonians",
    "2 Thessalonians",
    "1 Timothy",
    "2 Timothy",
    "Titus",
    "Philemon",
    "Hebrews",
    "James",
    "1 Peter",
    "2 Peter",
    "1 John",
    "2 John",
    "3 John",
    "Jude",
    "Revelation",
  ];

  // Insert Old Testament books
  for (let i = 0; i < oldTestamentBooks.length; i++) {
    await db.run(
      "INSERT INTO bible_books (name, testament, book_order, chapters) VALUES (?, ?, ?, ?)",
      oldTestamentBooks[i],
      "old",
      i + 1,
      50, // chapter count
    );
  }

  // Insert New Testament books
  for (let i = 0; i < newTestamentBooks.length; i++) {
    await db.run(
      "INSERT INTO bible_books (name, testament, book_order, chapters) VALUES (?, ?, ?, ?)",
      newTestamentBooks[i],
      "new",
      i + 1,
      28, // chapter count
    );
  }

  console.log("Bible books seeded");
}

async function seedRosaryMysteries() {
  if (!db) return;

  const mysteries = [
    // Joyful Mysteries - For Youth Ministry, Family Ministry, Children's Ministry
    {
      type: "joyful",
      title: "The Annunciation",
      order: 1,
      description:
        "The angel Gabriel announces to Mary that she will conceive and bear the Son of God. Mary's 'Yes' teaches us trust and openness to God's will. Perfect meditation for youth discerning their vocation and families welcoming new life. Reflection: How do we respond when God calls us to something unexpected?",
    },
    {
      type: "joyful",
      title: "The Visitation",
      order: 2,
      description:
        "Mary visits her cousin Elizabeth, who is pregnant with John the Baptist. This mystery celebrates the joy of service to others and the bonds between families. Ideal for family ministry and teaching children about helping others. Reflection: How do we bring Christ to others through our actions?",
    },
    {
      type: "joyful",
      title: "The Nativity",
      order: 3,
      description:
        "Jesus is born in Bethlehem. God chooses humble beginnings to enter our world. This mystery reminds us that God comes to us in the ordinary and unexpected places. Perfect for Christmas preparation and family unity. Reflection: How do we welcome Jesus into our daily lives?",
    },
    {
      type: "joyful",
      title: "The Presentation",
      order: 4,
      description:
        "Mary and Joseph present Jesus in the Temple. Following Jewish law, they offer Jesus to God, teaching us about dedication and sacrifice. Simeon and Anna recognize Jesus as the Messiah. Reflection: How do we dedicate our lives to God's service?",
    },
    {
      type: "joyful",
      title: "Finding Jesus in the Temple",
      order: 5,
      description:
        "After three days of searching, Mary and Joseph find Jesus teaching in the Temple. This mystery speaks to parents' concerns and young people's growth in wisdom. Jesus shows us the importance of being about our Father's business. Reflection: How do we balance family life with our calling to serve God?",
    },

    // Sorrowful Mysteries - For Suffering Souls Ministry, Healthcare Ministry, Bereavement Ministry
    {
      type: "sorrowful",
      title: "The Agony in the Garden",
      order: 1,
      description:
        "Jesus prays in the Garden of Gethsemane, experiencing deep anguish while His disciples sleep. He accepts the Father's will despite His human fear. This mystery comforts those facing difficult decisions or suffering. Reflection: How do we turn to prayer in our moments of greatest distress?",
    },
    {
      type: "sorrowful",
      title: "The Scourging at the Pillar",
      order: 2,
      description:
        "Jesus is bound to a pillar and brutally whipped. His silent endurance teaches us about patience in suffering and redemptive sacrifice. This mystery unites us with those experiencing physical pain or persecution. Reflection: How do we unite our sufferings with Christ's passion?",
    },
    {
      type: "sorrowful",
      title: "The Crowning with Thorns",
      order: 3,
      description:
        "Jesus is mocked and crowned with thorns, enduring humiliation and mental anguish. His royal dignity shines through human cruelty. This mystery speaks to those facing ridicule or rejection. Reflection: How do we maintain our dignity when others mock our faith?",
    },
    {
      type: "sorrowful",
      title: "The Carrying of the Cross",
      order: 4,
      description:
        "Jesus carries His cross to Calvary, helped by Simon of Cyrene and comforted by Veronica and the women of Jerusalem. This mystery teaches us about accepting our daily crosses and helping others carry theirs. Reflection: How do we embrace our daily struggles as opportunities to follow Christ?",
    },
    {
      type: "sorrowful",
      title: "The Crucifixion",
      order: 5,
      description:
        "Jesus dies on the cross for our salvation, speaking words of forgiveness and love. His ultimate sacrifice opens heaven for us. This mystery is central to our faith and hope. Reflection: How does Christ's sacrifice change how we live and love?",
    },

    // Glorious Mysteries - For Evangelization Ministry, Mission Ministry, Adult Formation
    {
      type: "glorious",
      title: "The Resurrection",
      order: 1,
      description:
        "Jesus rises from the dead on Easter Sunday, conquering sin and death. His resurrection is the foundation of our faith and the source of our hope for eternal life. Perfect for strengthening faith and evangelization efforts. Reflection: How does the reality of the Resurrection change our perspective on life and death?",
    },
    {
      type: "glorious",
      title: "The Ascension",
      order: 2,
      description:
        "Jesus ascends into Heaven, returning to the Father while promising to send the Holy Spirit. He commissions the apostles to spread the Gospel to all nations. This mystery inspires missionary work and evangelization. Reflection: How are we called to continue Christ's mission in our world today?",
    },
    {
      type: "glorious",
      title: "The Descent of the Holy Spirit",
      order: 3,
      description:
        "The Holy Spirit descends upon the Apostles at Pentecost, transforming them from fearful men into bold preachers of the Gospel. The Church is born. Essential for confirmation preparation and ministry formation. Reflection: How do we allow the Holy Spirit to work through us in our daily lives?",
    },
    {
      type: "glorious",
      title: "The Assumption of Mary",
      order: 4,
      description:
        "Mary is taken up into Heaven, body and soul, as the first to share fully in her Son's victory over death. She becomes our advocate and model of holiness. Perfect for Marian devotion and women's ministry. Reflection: How does Mary's example inspire us to live holy lives?",
    },
    {
      type: "glorious",
      title: "The Coronation of Mary",
      order: 5,
      description:
        "Mary is crowned Queen of Heaven and Earth, interceding for all her children. Her queenship reminds us of our call to reign with Christ in heaven. This mystery strengthens our devotion to Mary and our hope for eternal glory. Reflection: How do we honor Mary's role in our spiritual journey?",
    },

    // Luminous Mysteries - For Liturgy Ministry, Catechesis Ministry, RCIA Ministry
    {
      type: "luminous",
      title: "The Baptism of Jesus",
      order: 1,
      description:
        "Jesus is baptized by John in the Jordan River, and the Trinity is revealed as the Father speaks and the Spirit descends. Jesus' baptism inaugurates His public ministry. Essential for baptismal preparation and RCIA. Reflection: How do we live out our baptismal promises daily?",
    },
    {
      type: "luminous",
      title: "The Wedding at Cana",
      order: 2,
      description:
        "Jesus performs His first miracle, turning water into wine at the wedding feast. Mary's intercession leads to this sign, and Jesus reveals His glory. Perfect for marriage preparation and family ministry. Reflection: How do we invite Jesus to transform the ordinary moments of our lives?",
    },
    {
      type: "luminous",
      title: "The Proclamation of the Kingdom",
      order: 3,
      description:
        "Jesus proclaims the Kingdom of God and calls us to conversion. He preaches the Beatitudes and teaches us to seek first the Kingdom of Heaven. Central to adult faith formation and social justice ministry. Reflection: How do we live as citizens of God's Kingdom in our daily choices?",
    },
    {
      type: "luminous",
      title: "The Transfiguration",
      order: 4,
      description:
        "Jesus is transfigured on Mount Tabor, revealing His divine glory to Peter, James, and John. This preview of resurrection glory strengthens the apostles for the passion ahead. Important for spiritual direction and contemplative prayer. Reflection: How do moments of prayer and contemplation strengthen us for service?",
    },
    {
      type: "luminous",
      title: "The Institution of the Eucharist",
      order: 5,
      description:
        "Jesus gives us the gift of the Eucharist at the Last Supper, offering His Body and Blood under the forms of bread and wine. This supreme gift becomes the source and summit of our faith. Essential for Eucharistic adoration and First Communion preparation. Reflection: How does the Eucharist transform our lives and unite us as one body?",
    },
  ];

  for (const mystery of mysteries) {
    await db.run(
      "INSERT INTO rosary_mysteries (type, title, mystery_order, description) VALUES (?, ?, ?, ?)",
      mystery.type,
      mystery.title,
      mystery.order,
      mystery.description,
    );
  }

  console.log("Rosary mysteries seeded");
}

async function seedSampleAnnouncements() {
  if (!db) return;

  const currentDate = new Date();
  const nextSunday = new Date(currentDate);
  nextSunday.setDate(currentDate.getDate() + (7 - currentDate.getDay()));

  const formatDate = (date: Date) => date.toISOString().split("T")[0];
  const addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const announcements = [
    {
      title: "Youth Mass and Fellowship",
      description:
        "Join us for our monthly youth mass followed by fellowship and refreshments. Come together as we celebrate our faith and build community bonds. This month's theme focuses on 'Walking with Mary' as we deepen our devotion to Our Lady.",
      date: formatDate(nextSunday),
      time: "10:00 AM",
      venue: "Merisho Parish Church",
      created_by: 1,
    },
    {
      title: "Bible Study Group - Gospel of Matthew",
      description:
        "Weekly Bible study focusing on the Gospel of Matthew. All youth are welcome to join us as we dive deeper into God's word and its application in our daily lives. This week we'll explore the Beatitudes and their relevance to young Catholics today.",
      date: formatDate(addDays(currentDate, 2)),
      time: "6:00 PM",
      venue: "Parish Hall - Room 2",
      created_by: 1,
    },
    {
      title: "Pilgrimage to Subukia Shrine - Planning Meeting",
      description:
        "Important meeting to discuss and plan our upcoming pilgrimage to Subukia Shrine. We'll cover logistics, costs, preparation details, and spiritual preparation. Please bring your registration forms and initial deposit.",
      date: formatDate(addDays(currentDate, 5)),
      time: "7:00 PM",
      venue: "Youth Center",
      created_by: 1,
    },
    {
      title: "Rosary Crusade for Peace",
      description:
        "Join us for a special rosary crusade praying for peace in our world, especially for areas affected by conflict. We'll pray all four sets of mysteries together as a community. Bring your family and friends.",
      date: formatDate(addDays(currentDate, 7)),
      time: "3:00 PM",
      venue: "Parish Grotto",
      created_by: 1,
    },
    {
      title: "Vocations Talk - Discerning God's Call",
      description:
        "A special talk by Fr. Martin on discerning God's call in your life. Perfect for young people considering religious life, marriage, or single life dedicated to service. Followed by Q&A and personal spiritual direction appointments.",
      date: formatDate(addDays(currentDate, 10)),
      time: "4:00 PM",
      venue: "Parish Hall",
      created_by: 1,
    },
    {
      title: "Community Service - Orphanage Visit",
      description:
        "Monthly visit to St. Teresa's Children's Home. We'll be bringing donations, playing with the children, and helping with various activities. This is a great opportunity to live out our faith through service to others.",
      date: formatDate(addDays(currentDate, 14)),
      time: "2:00 PM",
      venue: "St. Teresa's Children's Home",
      created_by: 1,
    },
  ];

  for (const announcement of announcements) {
    await db.run(
      "INSERT INTO announcements (title, description, date, time, venue, created_by) VALUES (?, ?, ?, ?, ?, ?)",
      announcement.title,
      announcement.description,
      announcement.date,
      announcement.time,
      announcement.venue,
      announcement.created_by,
    );
  }

  console.log("Sample announcements seeded");

  // Seed sample Sunday readings
  await seedSampleSundayReadings();
}

async function seedSampleTripAlbums() {
  if (!db) return;

  const albums = [
    {
      title: "Subukia Shrine Pilgrimage 2024",
      description:
        "Our annual pilgrimage to the sacred Subukia Shrine. A journey of faith, prayer, and spiritual renewal.",
      cover_photo: "/api/uploads/subukia-cover.jpg",
      created_by: 1,
    },
    {
      title: "Youth Retreat - Tigoni",
      description:
        "Three-day spiritual retreat focused on prayer, meditation, and fellowship among the youth.",
      cover_photo: "/api/uploads/tigoni-cover.jpg",
      created_by: 1,
    },
    {
      title: "Christmas Caroling 2023",
      description:
        "Spreading Christmas joy through carols in our local community. Visiting families and sharing the message of hope.",
      cover_photo: "/api/uploads/christmas-cover.jpg",
      created_by: 1,
    },
  ];

  for (const album of albums) {
    await db.run(
      "INSERT INTO trip_albums (title, description, cover_photo, created_by) VALUES (?, ?, ?, ?)",
      album.title,
      album.description,
      album.cover_photo,
      album.created_by,
    );
  }

  console.log("Sample trip albums seeded");
}

async function seedSampleSundayReadings() {
  if (!db) return;

  const currentDate = new Date();
  const getNextSunday = (date: Date, weeksAhead: number = 0) => {
    const result = new Date(date);
    result.setDate(date.getDate() + (7 - date.getDay()) + weeksAhead * 7);
    return result.toISOString().split("T")[0];
  };

  const sundayReadings = [
    {
      title: "First Sunday of Advent - A Time of Waiting and Hope",
      reading_text:
        "First Reading: Isaiah 2:1-5 - The word that Isaiah saw concerning Judah and Jerusalem. In days to come, the mountain of the LORD's house shall be established as the highest mountain. All nations shall stream toward it. They shall beat their swords into plowshares and their spears into pruning hooks. O house of Jacob, come, let us walk in the light of the LORD!\n\nResponsorial Psalm: Psalm 122 - Let us go rejoicing to the house of the Lord.\n\nSecond Reading: Romans 13:11-14 - You know the time; it is the hour now for you to awake from sleep. Let us conduct ourselves properly as in the day. Put on the Lord Jesus Christ.\n\nGospel: Matthew 24:37-44 - As it was in the days of Noah, so it will be at the coming of the Son of Man. Therefore, stay awake! For you do not know on which day your Lord will come.\n\nReflection: This first Sunday of Advent calls us to vigilance and preparation for the coming of Christ.",
      sunday_date: getNextSunday(currentDate, 0),
      uploaded_by: 1,
    },
    {
      title: "Second Sunday of Advent - Prepare the Way of the Lord",
      reading_text:
        "First Reading: Isaiah 11:1-10 - A shoot shall sprout from the stump of Jesse, and from his roots a bud shall blossom. The spirit of the LORD shall rest upon him: a spirit of wisdom and understanding.\n\nResponsorial Psalm: Psalm 72 - Justice shall flourish in his time, and fullness of peace for ever.\n\nSecond Reading: Romans 15:4-9 - Whatever was written previously was written for our instruction, that by endurance and encouragement of the Scriptures we might have hope.\n\nGospel: Matthew 3:1-12 - John the Baptist appeared, preaching in the desert saying, 'Repent, for the kingdom of heaven is at hand!' Prepare the way of the Lord, make straight his paths.\n\nReflection: John the Baptist calls us to repentance and preparation for the coming Messiah.",
      sunday_date: getNextSunday(currentDate, 1),
      uploaded_by: 1,
    },
    {
      title: "Third Sunday of Advent - Gaudete Sunday (Rejoice!)",
      reading_text:
        "First Reading: Isaiah 35:1-6a, 10 - The desert and the parched land will exult; the steppe will rejoice and bloom. Be strong, fear not! Here is your God, he comes to save you.\n\nResponsorial Psalm: Psalm 146 - Lord, come and save us.\n\nSecond Reading: James 5:7-10 - Be patient, brothers and sisters, until the coming of the Lord. Make your hearts firm, because the coming of the Lord is at hand.\n\nGospel: Matthew 11:2-11 - Are you the one who is to come? Go and tell John what you hear and see: the blind regain their sight, the lame walk, the poor have the good news proclaimed to them.\n\nReflection: This is Gaudete Sunday - a day of joy. We rejoice because our salvation is near.",
      sunday_date: getNextSunday(currentDate, 2),
      uploaded_by: 1,
    },
    {
      title: "Fourth Sunday of Advent - The Annunciation",
      reading_text:
        "First Reading: Isaiah 7:10-14 - The Lord himself will give you this sign: the virgin shall conceive, and bear a son, and shall name him Emmanuel.\n\nResponsorial Psalm: Psalm 24 - Let the Lord enter; he is king of glory.\n\nSecond Reading: Romans 1:1-7 - Paul, a slave of Christ Jesus, called to be an apostle and set apart for the gospel about his Son, Jesus Christ our Lord.\n\nGospel: Matthew 1:18-24 - This is how the birth of Jesus Christ came about. Joseph, do not be afraid to take Mary your wife into your home. For it is through the Holy Spirit that this child has been conceived.\n\nReflection: Mary's 'yes' to God and Joseph's faithful obedience show us how to respond to God's call.",
      sunday_date: getNextSunday(currentDate, 3),
      uploaded_by: 1,
    },
    {
      title: "The Nativity of the Lord - Christmas Day",
      reading_text:
        "First Reading: Isaiah 52:7-10 - How beautiful upon the mountains are the feet of him who brings glad tidings, announcing peace, bearing good news, announcing salvation.\n\nResponsorial Psalm: Psalm 98 - All the ends of the earth have seen the saving power of God.\n\nSecond Reading: Hebrews 1:1-6 - In times past, God spoke through the prophets; in these last days, he has spoken to us through the Son.\n\nGospel: John 1:1-18 - In the beginning was the Word, and the Word was with God, and the Word was God. The Word became flesh and made his dwelling among us.\n\nReflection: Today we celebrate the birth of our Savior. The Word of God has become flesh and dwells among us.",
      sunday_date: getNextSunday(currentDate, 4),
      uploaded_by: 1,
    },
  ];

  for (const reading of sundayReadings) {
    await db.run(
      "INSERT INTO sunday_readings (title, reading_text, sunday_date, uploaded_by) VALUES (?, ?, ?, ?)",
      reading.title,
      reading.reading_text,
      reading.sunday_date,
      reading.uploaded_by,
    );
  }

  console.log("Sample Sunday readings seeded");
}

async function seedSampleVerses() {
  if (!db) return;

  // Comprehensive verses from key books for better Bible functionality
  const sampleVerses = [
    // Genesis - Creation and foundational stories
    {
      book_id: 1,
      chapter: 1,
      verse: 1,
      text: "In the beginning God created the heavens and the earth.",
    },
    {
      book_id: 1,
      chapter: 1,
      verse: 27,
      text: "So God created mankind in his own image, in the image of God he created them; male and female he created them.",
    },
    {
      book_id: 1,
      chapter: 3,
      verse: 15,
      text: "And I will put enmity between you and the woman, and between your offspring and hers; he will crush your head, and you will strike his heel.",
    },
    {
      book_id: 1,
      chapter: 12,
      verse: 2,
      text: "I will make you into a great nation, and I will bless you; I will make your name great, and you will be a blessing.",
    },
    {
      book_id: 1,
      chapter: 22,
      verse: 18,
      text: "And through your offspring all nations on earth will be blessed, because you have obeyed me.",
    },

    // Exodus - Liberation and covenant
    {
      book_id: 2,
      chapter: 3,
      verse: 14,
      text: "God said to Moses, 'I AM WHO I AM. This is what you are to say to the Israelites: I AM has sent me to you.'",
    },
    {
      book_id: 2,
      chapter: 20,
      verse: 3,
      text: "You shall have no other gods before me.",
    },
    {
      book_id: 2,
      chapter: 20,
      verse: 12,
      text: "Honor your father and your mother, so that you may live long in the land the Lord your God is giving you.",
    },

    // Deuteronomy - The Law and love of God
    {
      book_id: 5,
      chapter: 6,
      verse: 4,
      text: "Hear, O Israel: The Lord our God, the Lord is one.",
    },
    {
      book_id: 5,
      chapter: 6,
      verse: 5,
      text: "Love the Lord your God with all your heart and with all your soul and with all your strength.",
    },
    {
      book_id: 5,
      chapter: 30,
      verse: 19,
      text: "This day I call the heavens and the earth as witnesses against you that I have set before you life and death, blessings and curses. Now choose life, so that you and your children may live.",
    },

    // Psalms - Prayers and worship
    {
      book_id: 19,
      chapter: 1,
      verse: 1,
      text: "Blessed is the one who does not walk in step with the wicked or stand in the way that sinners take or sit in the company of mockers.",
    },
    {
      book_id: 19,
      chapter: 23,
      verse: 1,
      text: "The Lord is my shepherd, I lack nothing.",
    },
    {
      book_id: 19,
      chapter: 23,
      verse: 4,
      text: "Even though I walk through the darkest valley, I will fear no evil, for you are with me; your rod and your staff, they comfort me.",
    },
    {
      book_id: 19,
      chapter: 46,
      verse: 10,
      text: "Be still, and know that I am God; I will be exalted among the nations, I will be exalted in the earth.",
    },
    {
      book_id: 19,
      chapter: 51,
      verse: 10,
      text: "Create in me a pure heart, O God, and renew a steadfast spirit within me.",
    },
    {
      book_id: 19,
      chapter: 91,
      verse: 1,
      text: "Whoever dwells in the shelter of the Most High will rest in the shadow of the Almighty.",
    },
    {
      book_id: 19,
      chapter: 118,
      verse: 24,
      text: "This is the day the Lord has made; let us rejoice and be glad in it.",
    },
    {
      book_id: 19,
      chapter: 139,
      verse: 14,
      text: "I praise you because I am fearfully and wonderfully made; your works are wonderful, I know that full well.",
    },

    // Proverbs - Wisdom literature
    {
      book_id: 20,
      chapter: 3,
      verse: 5,
      text: "Trust in the Lord with all your heart and lean not on your own understanding.",
    },
    {
      book_id: 20,
      chapter: 3,
      verse: 6,
      text: "In all your ways submit to him, and he will make your paths straight.",
    },
    {
      book_id: 20,
      chapter: 16,
      verse: 9,
      text: "In their hearts humans plan their course, but the Lord establishes their steps.",
    },
    {
      book_id: 20,
      chapter: 22,
      verse: 6,
      text: "Start children off on the way they should go, and even when they are old they will not turn from it.",
    },
    {
      book_id: 20,
      chapter: 31,
      verse: 25,
      text: "She is clothed with strength and dignity; she can laugh at the days to come.",
    },

    // Isaiah - Messianic prophecies
    {
      book_id: 23,
      chapter: 7,
      verse: 14,
      text: "Therefore the Lord himself will give you a sign: The virgin will conceive and give birth to a son, and will call him Immanuel.",
    },
    {
      book_id: 23,
      chapter: 9,
      verse: 6,
      text: "For to us a child is born, to us a son is given, and the government will be on his shoulders. And he will be called Wonderful Counselor, Mighty God, Everlasting Father, Prince of Peace.",
    },
    {
      book_id: 23,
      chapter: 40,
      verse: 31,
      text: "But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.",
    },
    {
      book_id: 23,
      chapter: 53,
      verse: 5,
      text: "But he was pierced for our transgressions, he was crushed for our iniquities; the punishment that brought us peace was on him, and by his wounds we are healed.",
    },
    {
      book_id: 23,
      chapter: 55,
      verse: 8,
      text: "For my thoughts are not your thoughts, neither are your ways my ways, declares the Lord.",
    },

    // Jeremiah - Hope and restoration
    {
      book_id: 24,
      chapter: 1,
      verse: 5,
      text: "Before I formed you in the womb I knew you, before you were born I set you apart; I appointed you as a prophet to the nations.",
    },
    {
      book_id: 24,
      chapter: 29,
      verse: 11,
      text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, to give you hope and a future.",
    },
    {
      book_id: 24,
      chapter: 31,
      verse: 3,
      text: "The Lord appeared to us in the past, saying: I have loved you with an everlasting love; I have drawn you with unfailing kindness.",
    },

    // Matthew - The Gospel begins
    {
      book_id: 40,
      chapter: 1,
      verse: 23,
      text: "The virgin will conceive and give birth to a son, and they will call him Immanuel (which means 'God with us').",
    },
    {
      book_id: 40,
      chapter: 5,
      verse: 3,
      text: "Blessed are the poor in spirit, for theirs is the kingdom of heaven.",
    },
    {
      book_id: 40,
      chapter: 5,
      verse: 14,
      text: "You are the light of the world. A town built on a hill cannot be hidden.",
    },
    {
      book_id: 40,
      chapter: 5,
      verse: 16,
      text: "In the same way, let your light shine before others, that they may see your good deeds and glorify your Father in heaven.",
    },
    {
      book_id: 40,
      chapter: 6,
      verse: 9,
      text: "This, then, is how you should pray: Our Father in heaven, hallowed be your name.",
    },
    {
      book_id: 40,
      chapter: 11,
      verse: 28,
      text: "Come to me, all you who are weary and burdened, and I will give you rest.",
    },
    {
      book_id: 40,
      chapter: 28,
      verse: 19,
      text: "Therefore go and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit.",
    },

    // Luke - Gospel of mercy
    {
      book_id: 42,
      chapter: 1,
      verse: 28,
      text: "The angel went to her and said, 'Greetings, you who are highly favored! The Lord is with you.'",
    },
    {
      book_id: 42,
      chapter: 1,
      verse: 38,
      text: "I am the Lord's servant, Mary answered. May your word to me be fulfilled. Then the angel left her.",
    },
    {
      book_id: 42,
      chapter: 2,
      verse: 11,
      text: "Today in the town of David a Savior has been born to you; he is the Messiah, the Lord.",
    },
    {
      book_id: 42,
      chapter: 6,
      verse: 31,
      text: "Do to others as you would have them do to you.",
    },

    // John - Divine love revealed
    {
      book_id: 43,
      chapter: 1,
      verse: 1,
      text: "In the beginning was the Word, and the Word was with God, and the Word was God.",
    },
    {
      book_id: 43,
      chapter: 1,
      verse: 14,
      text: "The Word became flesh and made his dwelling among us. We have seen his glory, the glory of the one and only Son, who came from the Father, full of grace and truth.",
    },
    {
      book_id: 43,
      chapter: 3,
      verse: 16,
      text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",
    },
    {
      book_id: 43,
      chapter: 8,
      verse: 12,
      text: "When Jesus spoke again to the people, he said, 'I am the light of the world. Whoever follows me will never walk in darkness, but will have the light of life.'",
    },
    {
      book_id: 43,
      chapter: 14,
      verse: 6,
      text: "Jesus answered, 'I am the way and the truth and the life. No one comes to the Father except through me.'",
    },
    {
      book_id: 43,
      chapter: 14,
      verse: 27,
      text: "Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid.",
    },
    {
      book_id: 43,
      chapter: 15,
      verse: 13,
      text: "Greater love has no one than this: to lay down one's life for one's friends.",
    },

    // Romans - Salvation explained
    {
      book_id: 45,
      chapter: 1,
      verse: 16,
      text: "For I am not ashamed of the gospel, because it is the power of God that brings salvation to everyone who believes: first to the Jew, then to the Gentile.",
    },
    {
      book_id: 45,
      chapter: 3,
      verse: 23,
      text: "For all have sinned and fall short of the glory of God.",
    },
    {
      book_id: 45,
      chapter: 5,
      verse: 8,
      text: "But God demonstrates his own love for us in this: While we were still sinners, Christ died for us.",
    },
    {
      book_id: 45,
      chapter: 8,
      verse: 28,
      text: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.",
    },
    {
      book_id: 45,
      chapter: 12,
      verse: 2,
      text: "Do not conform to the pattern of this world, but be transformed by the renewing of your mind. Then you will be able to test and approve what God's will is—his good, pleasing and perfect will.",
    },
    {
      book_id: 45,
      chapter: 12,
      verse: 12,
      text: "Be joyful in hope, patient in affliction, faithful in prayer.",
    },

    // 1 Corinthians - Love and spiritual gifts
    {
      book_id: 46,
      chapter: 13,
      verse: 4,
      text: "Love is patient, love is kind. It does not envy, it does not boast, it is not proud.",
    },
    {
      book_id: 46,
      chapter: 13,
      verse: 7,
      text: "It always protects, always trusts, always hopes, always perseveres.",
    },
    {
      book_id: 46,
      chapter: 13,
      verse: 13,
      text: "And now these three remain: faith, hope and love. But the greatest of these is love.",
    },
    {
      book_id: 46,
      chapter: 15,
      verse: 55,
      text: "Where, O death, is your victory? Where, O death, is your sting?",
    },

    // Galatians - Freedom in Christ
    {
      book_id: 48,
      chapter: 2,
      verse: 20,
      text: "I have been crucified with Christ and I no longer live, but Christ lives in me. The life I now live in the body, I live by faith in the Son of God, who loved me and gave himself for me.",
    },
    {
      book_id: 48,
      chapter: 5,
      verse: 22,
      text: "But the fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness, gentleness and self-control.",
    },

    // Ephesians - Unity in Christ
    {
      book_id: 49,
      chapter: 2,
      verse: 8,
      text: "For it is by grace you have been saved, through faith—and this is not from yourselves, it is the gift of God.",
    },
    {
      book_id: 49,
      chapter: 6,
      verse: 11,
      text: "Put on the full armor of God, so that you can take your stand against the devil's schemes.",
    },

    // Philippians - Joy in Christ
    {
      book_id: 50,
      chapter: 4,
      verse: 4,
      text: "Rejoice in the Lord always. I will say it again: Rejoice!",
    },
    {
      book_id: 50,
      chapter: 4,
      verse: 6,
      text: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.",
    },
    {
      book_id: 50,
      chapter: 4,
      verse: 13,
      text: "I can do all this through him who gives me strength.",
    },

    // Colossians - Christ supreme
    {
      book_id: 51,
      chapter: 3,
      verse: 2,
      text: "Set your minds on things above, not on earthly things.",
    },
    {
      book_id: 51,
      chapter: 3,
      verse: 23,
      text: "Whatever you do, work at it with all your heart, as working for the Lord, not for human masters.",
    },

    // 1 Timothy - Pastoral guidance
    {
      book_id: 54,
      chapter: 6,
      verse: 12,
      text: "Fight the good fight of the faith. Take hold of the eternal life to which you were called when you made your good confession in the presence of many witnesses.",
    },

    // Hebrews - Faith and perseverance
    {
      book_id: 58,
      chapter: 11,
      verse: 1,
      text: "Now faith is confidence in what we hope for and assurance about what we do not see.",
    },
    {
      book_id: 58,
      chapter: 12,
      verse: 1,
      text: "Therefore, since we are surrounded by such a great cloud of witnesses, let us throw off everything that hinders and the sin that so easily entangles.",
    },
    {
      book_id: 58,
      chapter: 13,
      verse: 8,
      text: "Jesus Christ is the same yesterday and today and forever.",
    },

    // James - Practical faith
    {
      book_id: 59,
      chapter: 1,
      verse: 17,
      text: "Every good and perfect gift is from above, coming down from the Father of the heavenly lights, who does not change like shifting shadows.",
    },
    {
      book_id: 59,
      chapter: 4,
      verse: 8,
      text: "Come near to God and he will come near to you. Wash your hands, you sinners, and purify your hearts, you double-minded.",
    },

    // 1 Peter - Hope in suffering
    {
      book_id: 60,
      chapter: 2,
      verse: 9,
      text: "But you are a chosen people, a royal priesthood, a holy nation, God's special possession, that you may declare the praises of him who called you out of darkness into his wonderful light.",
    },
    {
      book_id: 60,
      chapter: 5,
      verse: 7,
      text: "Cast all your anxiety on him because he cares for you.",
    },

    // 1 John - God is love
    {
      book_id: 62,
      chapter: 1,
      verse: 9,
      text: "If we confess our sins, he is faithful and just and will forgive us our sins and purify us from all unrighteousness.",
    },
    {
      book_id: 62,
      chapter: 4,
      verse: 8,
      text: "Whoever does not love does not know God, because God is love.",
    },
    {
      book_id: 62,
      chapter: 4,
      verse: 19,
      text: "We love because he first loved us.",
    },

    // Revelation - Victory and eternity
    {
      book_id: 66,
      chapter: 3,
      verse: 20,
      text: "Here I am! I stand at the door and knock. If anyone hears my voice and opens the door, I will come in and eat with that person, and they with me.",
    },
    {
      book_id: 66,
      chapter: 21,
      verse: 4,
      text: "He will wipe every tear from their eyes. There will be no more death or mourning or crying or pain, for the old order of things has passed away.",
    },
  ];

  for (const verse of sampleVerses) {
    await db.run(
      "INSERT INTO bible_verses (book_id, chapter, verse, text) VALUES (?, ?, ?, ?)",
      verse.book_id,
      verse.chapter,
      verse.verse,
      verse.text,
    );
  }

  console.log("Sample Bible verses seeded");
}

export async function closeDatabase() {
  if (db) {
    await db.close();
    db = null;
    console.log("Database connection closed");
  }
}
