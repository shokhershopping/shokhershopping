"use client";
import { allProducts } from "@/data/products";
import { openCartModal } from "@/utlis/openCartModal";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { useContext, useState } from "react";
import toast from "react-hot-toast";
const dataContext = React.createContext();
export const useContextElement = () => {
  return useContext(dataContext);
};

export default function Context({ children }) {
  const router = useRouter();
  const [cartProducts, setCartProducts] = useState([]);
  const [wishList, setWishList] = useState([]);
  const [compareItem, setCompareItem] = useState([1, 2, 3]);
  const [quickViewItem, setQuickViewItem] = useState(allProducts[0]);
  const [quickAddItem, setQuickAddItem] = useState(null);
  const [shareProduct, setShareProduct] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  useEffect(() => {
    const subtotal = cartProducts.reduce((accumulator, product) => {
      return accumulator + product.quantity * product.price;
    }, 0);
    setTotalPrice(subtotal);
  }, [cartProducts]);

  // Get authenticated user from Clerk
  const { user: clerkUser, isLoaded: isUserLoaded } = useUser();
  const [user, setUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);

  // Fetch user from database using Clerk user ID
  useEffect(() => {
    const fetchUserFromDatabase = async () => {
      if (!isUserLoaded || !clerkUser) {
        setUser(null);
        return;
      }

      setIsLoadingUser(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL}/users/${clerkUser.id}`
        );

        if (!response.ok) {
          console.error('User not found in database. Please ensure Clerk webhook is configured correctly.');
          setUser(null);
        } else {
          const data = await response.json();
          setUser(data.data);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(null);
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchUserFromDatabase();
  }, [clerkUser, isUserLoaded]);

  console.log("Authenticated User:", user);

  const addProductToCart = (product, qty) => {
    // Check if product already exists in cart
    if (!cartProducts.some((elm) => elm.id === product.id)) {
      const item = {
        ...product,
        quantity: qty || 1,
      };
      setCartProducts((prev) => [...prev, item]);
      toast.success("Added to cart");
      // openCartModal();
    } else {
      toast.info("Product already in cart");
    }
  };
  const isAddedToCartProducts = (id) => {
    return cartProducts.some((elm) => elm.id === id);
  };

  console.log("cartProducts", cartProducts);

  const updateQuantity = (id, qty) => {
    if (isAddedToCartProducts(id)) {
      let item = cartProducts.filter((elm) => elm.id == id)[0];
      let items = [...cartProducts];
      const itemIndex = items.indexOf(item);

      item.quantity = qty / 1;
      items[itemIndex] = item;
      setCartProducts(items);

      openCartModal();
    } else {
      addProductToCart(id, qty);
    }
  };

  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user]);
  //fetch wishlist from localStorage or API
  const fetchWishlist = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/wishlists/${user.id}`
      );
      if (!response.ok) throw new Error("Failed to fetch wishlist");
      const result = await response.json();
      // Backend returns { data: { items: [...] } }
      setWishList(result.data?.items || []);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
  };

  const addToWishlist = async (product) => {
    // Check if user is authenticated using Clerk
    if (!isUserLoaded) {
      toast.error("Please wait while we load your session...");
      return;
    }

    if (!clerkUser) {
      toast.error("Please sign in to add items to your wishlist");
      router.push("/sign-in");
      return;
    }

    if (!user) {
      console.error("User not available for wishlist operation");
      toast.error("Please wait while we complete your sign in");
      return;
    }
    console.log("Adding to wishlist 32323:", product);

    const isInWishlist = wishList.some((item) =>
      item.productId === product.id || item.variableProductId === product.id
    );

    try {
      if (isInWishlist) {
        // REMOVE FROM WISHLIST
        // Find the wishlist item to get its database ID
        const wishlistItem = wishList.find((item) =>
          item.productId === product.id || item.variableProductId === product.id
        );

        if (!wishlistItem) {
          console.error("Wishlist item not found");
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL}/wishlists/remove`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: user.id,
              itemIds: [wishlistItem.id], // Send WishlistItem.id, not product.id
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to remove from wishlist: ${response.status}`);
        }

        // Get the updated wishlist from backend response
        const result = await response.json();
        const updatedWishList = result.data?.items || [];

        // Update state with backend response
        setWishList(updatedWishList);
        localStorage.setItem("wishlist", JSON.stringify(updatedWishList));
        console.log("Successfully removed from wishlist");
        toast.success("Removed from wishlist");
      } else {
        // ADD TO WISHLIST
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL}/wishlists`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: user.id,
              items: [{ productId: product.id }],
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to add to wishlist: ${response.status}`);
        }

        // Get the updated wishlist from backend response
        const result = await response.json();
        const updatedWishList = result.data?.items || [];

        // Update state with backend response (includes proper IDs and structure)
        setWishList(updatedWishList);
        localStorage.setItem("wishlist", JSON.stringify(updatedWishList));
        console.log("Successfully added to wishlist");
        toast.success("Added to wishlist");
      }
    } catch (error) {
      console.error("Wishlist operation failed:", error);
      toast.error("Failed to update wishlist");
    }
  };

  const removeFromWishlist = async (product) => {
    // Check if user is authenticated using Clerk
    if (!isUserLoaded) {
      toast.error("Please wait while we load your session...");
      return;
    }

    if (!clerkUser) {
      toast.error("Please sign in to manage your wishlist");
      router.push("/sign-in");
      return;
    }

    if (!user) {
      console.error("User not available for wishlist operation");
      toast.error("Please wait while we complete your sign in");
      return;
    }
    console.log("Removing from wishlist:", product);
    console.log("Current wishList state:", wishList);

    try {
      // Find the wishlist item to get its database ID
      const wishlistItem = wishList.find((item) =>
        item.productId === product.id || item.variableProductId === product.id
      );

      console.log("Found wishlist item:", wishlistItem);

      if (!wishlistItem) {
        console.error("Wishlist item not found in state");
        console.error("Looking for product.id:", product.id);
        console.error("Available items:", wishList.map(item => ({
          id: item.id,
          productId: item.productId,
          variableProductId: item.variableProductId
        })));
        return;
      }

      console.log("Sending removal request with itemId:", wishlistItem.id);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/wishlists/remove`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            itemIds: [wishlistItem.id], // Send WishlistItem.id, not product.id
          }),
        }
      );

      console.log("Remove response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Backend error response:", errorText);
        throw new Error(`Failed to remove from wishlist: ${response.status}`);
      }

      // Get the updated wishlist from backend response
      const result = await response.json();
      console.log("Backend response:", result);

      const updatedWishList = result.data?.items || [];
      console.log("Updated wishlist items:", updatedWishList);

      // Update state with backend response
      setWishList(updatedWishList);

      // Update localStorage
      localStorage.setItem("wishlist", JSON.stringify(updatedWishList));

      console.log("Successfully removed from wishlist. New state:", updatedWishList);
      toast.success("Removed from wishlist");
    } catch (error) {
      console.error("Wishlist removal failed:", error);
      console.error("Error details:", error.message);
      toast.error("Failed to remove from wishlist");
    }
  };
  const addToCompareItem = (id) => {
    if (!compareItem.includes(id)) {
      setCompareItem((pre) => [...pre, id]);
    }
  };
  const removeFromCompareItem = (id) => {
    if (compareItem.includes(id)) {
      setCompareItem((pre) => [...pre.filter((elm) => elm != id)]);
    }
  };
  const isAddedtoWishlist = (id) => {
    return wishList.some((item) =>
      item.productId === id || item.variableProductId === id
    );
  };

  console.log("wishList product items", wishList);

  const isAddedtoCompareItem = (id) => {
    if (compareItem.includes(id)) {
      return true;
    }
    return false;
  };
  useEffect(() => {
    const items = JSON.parse(localStorage.getItem("cartList"));
    if (items?.length) {
      setCartProducts(items);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cartList", JSON.stringify(cartProducts));
  }, [cartProducts]);
  // useEffect(() => {
  //   const items = JSON.parse(localStorage.getItem("wishlist"));
  //   if (items?.length) {
  //     setWishList(items);
  //   }
  // }, []);

  // useEffect(() => {
  //   localStorage.setItem("wishlist", JSON.stringify(wishList));
  // }, [wishList]);

  const contextElement = {
    cartProducts,
    user,
    isLoadingUser,
    setCartProducts,
    totalPrice,
    addProductToCart,
    isAddedToCartProducts,
    removeFromWishlist,
    addToWishlist,
    isAddedtoWishlist,
    quickViewItem,
    wishList,
    setQuickViewItem,
    quickAddItem,
    setQuickAddItem,
    shareProduct,
    setShareProduct,
    addToCompareItem,
    isAddedtoCompareItem,
    removeFromCompareItem,
    compareItem,
    setCompareItem,
    updateQuantity,
  };
  return (
    <dataContext.Provider value={contextElement}>
      {children}
    </dataContext.Provider>
  );
}
