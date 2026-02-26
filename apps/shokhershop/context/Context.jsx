"use client";
import { allProducts } from "@/data/products";
import { openCartModal } from "@/utlis/openCartModal";
import { useFirebaseAuth } from "@/lib/firebase-auth-provider";
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

  // Get authenticated user from Firebase
  const { user: firebaseUser, isLoaded: isUserLoaded, isSignedIn, getToken } = useFirebaseAuth();
  const [user, setUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);

  // Fetch user from database using Firebase user ID
  useEffect(() => {
    const fetchUserFromDatabase = async () => {
      if (!isUserLoaded || !firebaseUser) {
        setUser(null);
        return;
      }

      setIsLoadingUser(true);
      try {
        const token = await getToken();
        const response = await fetch(
          `/api/users/${firebaseUser.uid}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );

        if (response.ok) {
          const data = await response.json();
          setUser(data.data);
        } else if (response.status === 404) {
          // User doesn't exist in Firestore yet — create them
          const ensureRes = await fetch(`/api/users/ensure`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName,
              image: firebaseUser.photoURL,
            }),
          });
          if (ensureRes.ok) {
            const ensureData = await ensureRes.json();
            setUser(ensureData.data);
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchUserFromDatabase();
  }, [firebaseUser, isUserLoaded]);

  const addProductToCart = (product, qty) => {
    const existingIndex = cartProducts.findIndex((elm) => elm.id === product.id);
    if (existingIndex === -1) {
      // New product — add to cart
      const item = {
        ...product,
        quantity: qty || 1,
      };
      setCartProducts((prev) => [...prev, item]);
      toast.success("Added to cart");
    } else {
      // Already in cart — update quantity
      const updated = [...cartProducts];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: qty || updated[existingIndex].quantity + 1,
      };
      setCartProducts(updated);
      toast.success("Cart updated");
    }
  };
  const isAddedToCartProducts = (id) => {
    return cartProducts.some((elm) => elm.id === id);
  };

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
        `/api/wishlists/${user.id}`
      );
      if (!response.ok) throw new Error("Failed to fetch wishlist");
      const result = await response.json();
      // Backend returns { data: { items: [...] } }
      setWishList(result.data?.items || []);
    } catch (error) {
      // Silently handle wishlist fetch error
    }
  };

  const addToWishlist = async (product) => {
    // Check if user is authenticated
    if (!isUserLoaded) {
      toast.error("Please wait while we load your session...");
      return;
    }

    if (!firebaseUser) {
      toast.error("Please sign in to add items to your wishlist");
      router.push("/login");
      return;
    }

    if (!user) {
      toast.error("Please wait while we complete your sign in");
      return;
    }

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
          return;
        }

        const response = await fetch(
          `/api/wishlists/remove`,
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
        toast.success("Removed from wishlist");
      } else {
        // ADD TO WISHLIST
        const response = await fetch(
          `/api/wishlists`,
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
        toast.success("Added to wishlist");
      }
    } catch (error) {
      toast.error("Failed to update wishlist");
    }
  };

  const removeFromWishlist = async (product) => {
    // Check if user is authenticated
    if (!isUserLoaded) {
      toast.error("Please wait while we load your session...");
      return;
    }

    if (!firebaseUser) {
      toast.error("Please sign in to manage your wishlist");
      router.push("/login");
      return;
    }

    if (!user) {
      toast.error("Please wait while we complete your sign in");
      return;
    }

    try {
      const wishlistItem = wishList.find((item) =>
        item.productId === product.id || item.variableProductId === product.id
      );

      if (!wishlistItem) {
        return;
      }

      const response = await fetch(
        `/api/wishlists/remove`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            itemIds: [wishlistItem.id],
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to remove from wishlist: ${response.status}`);
      }

      const result = await response.json();
      const updatedWishList = result.data?.items || [];

      setWishList(updatedWishList);
      localStorage.setItem("wishlist", JSON.stringify(updatedWishList));
      toast.success("Removed from wishlist");
    } catch (error) {
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
