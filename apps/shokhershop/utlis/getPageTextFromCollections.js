import { womenCollection, menCollection, kidsCollection } from "@/data/menu";

const allCollections = [
  { key: "Women", data: womenCollection },
  { key: "Men", data: menCollection },
  { key: "Kids", data: kidsCollection },
];

export const getPageTextFromCollections = (path) => {
  for (const collection of allCollections) {
    for (const category of collection.data) {
      for (const link of category.links) {
        if (path === link.href || path.startsWith(link.href)) {
          return {
            heading: category.heading,
            subheading: link.text,
            category: collection.key,
          };
        }
      }
    }
  }

  // fallback logic
  if (path.includes("/shop/women")) {
    return { heading: "Women's Collection", subheading: "", category: "Women" };
  }
  if (path.includes("/shop/men")) {
    return { heading: "Men's Collection", subheading: "", category: "Men" };
  }
  if (path.includes("/shop/kids")) {
    return { heading: "Kids Collection", subheading: "", category: "Kids" };
  }

  return {
    heading: "New Arrival",
    subheading: "Shop through our latest selection of Fashion",
    category: "",
  };
};
