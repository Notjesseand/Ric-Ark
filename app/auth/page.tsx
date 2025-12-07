// "use client";

// import { useState, useEffect } from "react";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useRouter, useSearchParams } from "next/navigation";
// import { createUserWithEmailAndPassword } from "firebase/auth";
// import {
//   doc,
//   setDoc,
//   getDocs,
//   updateDoc,
//   query,
//   where,
//   collection,
//   arrayUnion,
// } from "firebase/firestore";
// import { auth, db } from "@/lib/firebase";
// import Spinner from "@/components/spinner";
// import Link from "next/link";

// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";

// const signUpSchema = z
//   .object({
//     firstName: z.string().min(1, "First name is required"),
//     lastName: z.string().min(1, "Last name is required"),
//     email: z.string().email("Invalid email"),
//     phone: z.string().min(1, "Phone number is required"),
//     password: z.string().min(6, "Password must be at least 6 characters"),
//     confirmPassword: z.string().min(1, "Please confirm your password"),
//     referralCode: z.string().optional(),
//   })
//   .refine((data) => data.password === data.confirmPassword, {
//     message: "Passwords do not match",
//     path: ["confirmPassword"],
//   });

// type SignUpFormData = z.infer<typeof signUpSchema>;

// function generateReferralCode(email: string) {
//   return (
//     email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "") +
//     Math.floor(Math.random() * 1000)
//   );
// }

// export default function SignUpPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const [loading, setLoading] = useState(false);

//   const form = useForm<SignUpFormData>({
//     resolver: zodResolver(signUpSchema),
//     defaultValues: {
//       firstName: "",
//       lastName: "",
//       email: "",
//       phone: "",
//       password: "",
//       confirmPassword: "",
//       referralCode: "",
//     },
//   });

//   useEffect(() => {
//     const code = searchParams.get("ref");
//     if (code) {
//       form.setValue("referralCode", code);
//     }
//   }, [searchParams, form]);

//   async function onSubmit(data: SignUpFormData) {
//     setLoading(true);
//     try {
//       const userCredential = await createUserWithEmailAndPassword(
//         auth,
//         data.email,
//         data.password
//       );
//       const user = userCredential.user;

//       const referralCode = generateReferralCode(data.email);
//       const referredBy = data.referralCode?.trim() || null;

//       const userData = {
//         uid: user.uid,
//         email: data.email,
//         firstName: data.firstName,
//         lastName: data.lastName,
//         phone: data.phone,
//         walletBalance: 0,
//         createdAt: new Date(),
//         referralCode,
//         referredBy,
//         referrals: [],
//       };

//       await Promise.all([
//         setDoc(doc(db, "users", user.uid), userData),
//         setDoc(doc(db, "userData", user.uid), userData),
//       ]);

//       if (referredBy) {
//         const refQuery = query(
//           collection(db, "users"),
//           where("referralCode", "==", referredBy)
//         );
//         const refSnap = await getDocs(refQuery);
//         if (!refSnap.empty) {
//           const referrerDoc = refSnap.docs[0];
//           await updateDoc(referrerDoc.ref, {
//             referrals: arrayUnion(user.uid),
//           });
//         }
//       }

//       router.push("/dashboard");
//     } catch (error: any) {
//       form.setError("email", { message: error.message || "Signup failed" });
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="px-1 font-montserrat text-sm">
//       <div className="max-w-md mx-auto mt-20 p-6 border rounded-xl shadow">
//         <div className="flex justify-center mb-4">
//           <img
//             src="/logo-2.png"
//             alt="RIC ARK Logo"
//             className="h-16 w-auto"
//           />
//         </div>

//         <h1 className="text-2xl font-bold mb-6 text-center font-montserrat">
//           Create an account
//         </h1>

//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//             <FormField
//               control={form.control}
//               name="firstName"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>First Name</FormLabel>
//                   <FormControl>
//                     <Input placeholder="First Name" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name="lastName"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Last Name</FormLabel>
//                   <FormControl>
//                     <Input placeholder="Last Name" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name="email"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Email</FormLabel>
//                   <FormControl>
//                     <Input
//                       type="email"
//                       placeholder="you@example.com"
//                       {...field}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name="phone"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Phone</FormLabel>
//                   <FormControl>
//                     <Input type="tel" placeholder="Phone number" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name="password"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Password</FormLabel>
//                   <FormControl>
//                     <Input type="password" placeholder="••••••••" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name="confirmPassword"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Confirm Password</FormLabel>
//                   <FormControl>
//                     <Input type="password" placeholder="••••••••" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name="referralCode"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Referral Code (optional)</FormLabel>
//                   <FormControl>
//                     <Input
//                       placeholder="Enter referral code (if any)"
//                       {...field}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <Button
//               type="submit"
//               className="w-full mt-2 py-2"
//               disabled={loading}
//             >
//               {loading ? <Spinner /> : "Create Account"}
//             </Button>

//             <p className="font-poppins pt-1 text-sm">
//               Already have an account?
//               <Link href="/auth/login" className="ml-1 text-blue-500">
//                 Log in
//               </Link>
//             </p>
//           </form>
//         </Form>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {
  doc,
  setDoc,
  getDocs,
  updateDoc,
  query,
  where,
  collection,
  arrayUnion,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import Spinner from "@/components/spinner";
import Link from "next/link";
import axios from "axios";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// 🔑 CORRECTED: Using the correct Site Key from your console.
const SITE_KEY = "6Ld1DSQsAAAAALLBu1PnlhKcJEyxkIsj3ns8rHYc";
// ❌ REMOVED: The Secret Key is now handled securely on the server (in the API route via environment variable).
// const SECRET_KEY = "...";

const signUpSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email"),
    phone: z.string().min(1, "Phone number is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    referralCode: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignUpFormData = z.infer<typeof signUpSchema>;

function generateReferralCode(email: string) {
  return (
    email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "") +
    Math.floor(Math.random() * 1000)
  );
}

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      referralCode: "",
    },
  });

  useEffect(() => {
    const code = searchParams.get("ref");
    if (code) {
      form.setValue("referralCode", code);
    }

    // Load Google recaptcha script
    const script = document.createElement("script");
    script.src = "https://www.google.com/recaptcha/api.js";
    script.async = true;
    document.body.appendChild(script);
  }, [searchParams, form]);

  async function onSubmit(data: SignUpFormData) {
    setLoading(true);

    // GET reCAPTCHA token from widget
    const token = (window as any).grecaptcha.getResponse();

    // Reset the widget to allow a new attempt if the user fails verification
    (window as any).grecaptcha.reset();

    if (!token) {
      form.setError("email", { message: "Please verify you are not a robot" });
      setLoading(false);
      return;
    }

    // ✅ SECURE VERIFICATION: Call the local API route instead of Google's public endpoint
    try {
      const verifyRes = await axios.post("/api/verify-captcha", { token });

      if (!verifyRes.data.success) {
        form.setError("email", {
          message: "Captcha verification failed. Please try again.",
        });
        setLoading(false);
        return;
      }

      // Proceed with Firebase signup only after successful Captcha verification
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const user = userCredential.user;

      const referralCode = generateReferralCode(data.email);
      const referredBy = data.referralCode?.trim() || null;

      const userData = {
        uid: user.uid,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        walletBalance: 0,
        createdAt: new Date(),
        referralCode,
        referredBy,
        referrals: [],
      };

      await Promise.all([
        setDoc(doc(db, "users", user.uid), userData),
        setDoc(doc(db, "userData", user.uid), userData),
      ]);

      if (referredBy) {
        const refQuery = query(
          collection(db, "users"),
          where("referralCode", "==", referredBy)
        );
        const refSnap = await getDocs(refQuery);
        if (!refSnap.empty) {
          const referrerDoc = refSnap.docs[0];
          await updateDoc(referrerDoc.ref, {
            referrals: arrayUnion(user.uid),
          });
        }
      }

      router.push("/dashboard");
    } catch (error: any) {
      // Catch errors from Firebase signup OR the API call
      form.setError("email", { message: error.message || "Signup failed" });
      setLoading(false);
    }
  }

  return (
    <div className="px-1 font-montserrat text-sm">
      <div className="max-w-md mx-auto mt-20 p-6 border rounded-xl shadow">
        <div className="flex justify-center mb-4">
          <img src="/logo-2.png" alt="RIC ARK Logo" className="h-16 w-auto" />
        </div>

        <h1 className="text-2xl font-bold mb-6 text-center font-montserrat">
          Create an account
        </h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* All original fields stay the same */}

            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="First Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Last Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="Phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="referralCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Referral Code (optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter referral code (if any)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ✔️ RECAPTCHA: Uses the correct, updated SITE_KEY constant */}
            <div className="flex justify-center pt-3">
              <div className="g-recaptcha" data-sitekey={SITE_KEY}></div>
            </div>

            <Button
              type="submit"
              className="w-full mt-2 py-2"
              disabled={loading}
            >
              {loading ? <Spinner /> : "Create Account"}
            </Button>

            <p className="font-poppins pt-1 text-sm">
              Already have an account?
              <Link href="/auth/login" className="ml-1 text-blue-500">
                Log in
              </Link>
            </p>
          </form>
        </Form>
      </div>
    </div>
  );
}