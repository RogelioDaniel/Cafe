import { db } from "@/lib/db";

async function seed() {
  console.log("🌱 Seeding Café Tonalli…");

  // --- Menu items ---
  const menu = [
    {
      slug: "cafe-de-olla-clasico",
      name: "Café de Olla Clásico",
      description:
        "Café de altura de Veracruz preparado en olla de barro con canela y piloncillo. El ritual que despierta a México.",
      price: 48,
      category: "cafe-de-olla",
      image: "/images/menu/cafe-de-olla.png",
      tags: "popular,clasico",
      origin: "Café Coatepec, Veracruz · 1,200 msnm",
      popular: true,
      sort: 1,
    },
    {
      slug: "cafe-de-olla-especial",
      name: "Café de Olla Especial Tonalli",
      description:
        "Nuestra receta de autor: café chiapaneco tueste oscuro, canela criolla, piloncillo de Campeche y un toque de chocolate de mesa.",
      price: 62,
      category: "cafe-de-olla",
      image: "/images/menu/cafe-de-olla.png",
      tags: "nuevo,de-autor",
      origin: "Café Jaltenango, Chiapas · 1,400 msnm",
      popular: true,
      sort: 2,
    },
    {
      slug: "americano-tonalli",
      name: "Americano Tonalli",
      description:
        "Doble espresso de café Oaxaca con agua caliente. Cuerpo medio, notas a chocolate y frutos secos.",
      price: 42,
      category: "cafe-de-olla",
      image: "/images/menu/cafe-de-olla.png",
      tags: "",
      origin: "Café Pluma Hidalgo, Oaxaca · 1,600 msnm",
      popular: false,
      sort: 3,
    },
    {
      slug: "chocolate-de-agua",
      name: "Chocolate de Agua",
      description:
        "Chocolate de metate batido con molinillo en jarra de barro. Receta prehispánica sin leche, con canela y pimienta.",
      price: 52,
      category: "cafe-de-olla",
      image: "/images/menu/chocolate.png",
      tags: "vegano,sin-gluten,clasico",
      origin: "Cacao Soconusco, Chiapas",
      popular: false,
      sort: 4,
    },
    {
      slug: "tacos-pastor",
      name: "Tacos al Pastor (orden de 3)",
      description:
        "Trompo de pastor marinado 24h, tortilla a mano de maíz nixtamalizado, piña, cebolla, cilantro y salsa de árbol.",
      price: 95,
      category: "antojitos",
      image: "/images/menu/tacos-pastor.png",
      tags: "popular,picante",
      origin: "Maíz criollo de Tlaxcala",
      popular: true,
      sort: 1,
    },
    {
      slug: "chilaquiles-rojos",
      name: "Chilaquiles Rojos de Comal",
      description:
        "Totopos de tortilla tostada en comal, salsa roja de guajillo y morita, crema fresca, queso Cotija, aguacate y huevo a elección.",
      price: 118,
      category: "antojitos",
      image: "/images/menu/chilaquiles.png",
      tags: "popular,clasico",
      origin: "Maíz cacahuacintle de Tlaxcala",
      popular: true,
      sort: 2,
    },
    {
      slug: "tamal-oaxaqueno",
      name: "Tamal Oaxaqueño de Mole",
      description:
        "Tamal envuelto en hoja de plátano, relleno de mole negro con pollo. Cocido al vapor en olla de barro.",
      price: 78,
      category: "antojitos",
      image: "/images/menu/tamal.png",
      tags: "clasico",
      origin: "Mole de San Pedro, Oaxaca",
      popular: false,
      sort: 3,
    },
    {
      slug: "conchas-artesanales",
      name: "Conchas Artesanales (2 pzs)",
      description:
        "Conchas de masa brioche con cobertura de vainilla y chocolate, hechas cada mañana con mantequilla de rancho.",
      price: 45,
      category: "pan-dulce",
      image: "/images/menu/conchas.png",
      tags: "popular,clasico",
      origin: "Mantequilla de Tizimín, Yucatán",
      popular: true,
      sort: 1,
    },
    {
      slug: "cuernitos-nuez",
      name: "Cuernitos de Nuez",
      description:
        "Medialunas laminadas con mantequilla y nuez de Castilla, glaseado de piloncillo y café.",
      price: 38,
      category: "pan-dulce",
      image: "/images/menu/conchas.png",
      tags: "nuevo",
      origin: "Nuez de Perote, Veracruz",
      popular: false,
      sort: 2,
    },
    {
      slug: "tres-leches-tonalli",
      name: "Pastel de Tres Leches Tonalli",
      description:
        "Bizcocho de vainilla mexicana bañado en tres leches, coronado con merengue tostado y caramelo de café.",
      price: 85,
      category: "postres",
      image: "/images/menu/tres-leches.png",
      tags: "popular,de-autor",
      origin: "Vainilla de Papantla, Veracruz",
      popular: true,
      sort: 1,
    },
    {
      slug: "flan-nopal",
      name: "Flan de Nopal y Caramelo",
      description:
        "Flan sedoso de nopal asado con caramelo de piloncillo. Suave, fresco y sorprendente.",
      price: 72,
      category: "postres",
      image: "/images/menu/tres-leches.png",
      tags: "nuevo,sin-gluten",
      origin: "Nopal de Milpa Alta, CDMX",
      popular: false,
      sort: 2,
    },
    {
      slug: "agua-jamaica",
      name: "Agua de Jamaica con Jengibre",
      description:
        "Agua fresca de flor de jamaica con un toque de jengibre y limón. Sin azúcar añadida.",
      price: 35,
      category: "bebidas",
      image: "/images/menu/agua-jamaica.png",
      tags: "vegano,sin-gluten",
      origin: "Flor de jamaica de Guerrero",
      popular: false,
      sort: 1,
    },
    {
      slug: "agua-horchata",
      name: "Agua de Horchata de Arroz",
      description:
        "Horchata cremosa de arroz con canela, almendra y un toque de vainilla. Servida bien fría.",
      price: 35,
      category: "bebidas",
      image: "/images/menu/agua-horchata.png",
      tags: "vegano,clasico",
      origin: "Canela criolla de Veracruz",
      popular: true,
      sort: 2,
    },
  ];

  for (const item of menu) {
    await db.menuItem.upsert({
      where: { slug: item.slug },
      update: item,
      create: item,
    });
  }
  console.log(`  ✓ ${menu.length} items de menú`);

  const counters = [
    { id: "cups_today", value: 1847 },
    { id: "orders_today", value: 312 },
    { id: "reservations_today", value: 48 },
    { id: "happy_customers", value: 28493 },
    { id: "viewers_now", value: 23 },
  ];
  for (const c of counters) {
    await db.statsCounter.upsert({
      where: { id: c.id },
      update: { value: c.value },
      create: c,
    });
  }
  console.log(`  ✓ ${counters.length} contadores en vivo`);

  const reviews = [
    {
      name: "Daniela Mendoza",
      rating: 5,
      comment:
        "El café de olla especial Tonalli es lo mejor que he probado en la Roma. Se nota el amor por el oficio. Las conchas recién hechas, otra dimensión.",
      source: "google",
      sort: 1,
    },
    {
      name: "Andrés Fuentes",
      rating: 5,
      comment:
        "Vine por curiosidad y volví tres veces en una semana. Los chilaquiles rojos con café de olla son la combinación perfecta para empezar el día.",
      source: "tripadvisor",
      sort: 2,
    },
    {
      name: "Sofía Ramírez",
      rating: 5,
      comment:
        "El espacio es hermoso, las mesas de barro, el papel picado, la luz. Y el flan de nopal me dejó sin palabras. Un pedacito de México hecho con orgullo.",
      source: "instagram",
      sort: 3,
    },
    {
      name: "Marco Téllez",
      rating: 5,
      comment:
        "Reservé por la web en 30 segundos, me asignaron mesa en terraza. El servicio impecable, el café de olla servido en olla de barro en la mesa. Premium.",
      source: "google",
      sort: 4,
    },
    {
      name: "Valeria Cruz",
      rating: 5,
      comment:
        "El barista AI me recomendó un americano Tonalli según mi estado de ánimo. Raro pero funcionó. El mejor americano de mi vida, en serio.",
      source: "instagram",
      sort: 5,
    },
  ];
  for (const r of reviews) {
    const existing = await db.review.findFirst({ where: { name: r.name } });
    if (!existing) await db.review.create({ data: r });
  }
  console.log(`  ✓ ${reviews.length} reseñas`);

  console.log("✅ Seed completo");
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
