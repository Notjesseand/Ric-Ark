//app/kyc/page.tsx

"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import Loading from "@/components/loading";
import Spinner from "@/components/spinner";
import { toast } from "sonner";

const MAX_FILE_SIZE = 2_000_000; // 2MB in bytes
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png"];

const kycSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  otherName: z.string().optional(),
  sex: z.enum(["Male", "Female", "Other"]),
  address: z.string().min(1),
  nationality: z.string().min(1),
  dob: z.string().min(1),
  maritalStatus: z.enum(["Single", "Married", "Divorced", "Widowed"]),
  idType: z.enum(["Passport", "Driver's License", "National ID", "other"]),
  idFront: z
    .instanceof(File)
    .optional()
    .refine(
      (file) => !file || file.size <= MAX_FILE_SIZE,
      `Image size exceeds 2MB. Please compress it using [TinyPNG](https://tinypng.com/) and try again.`
    )
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Only JPEG or PNG images are allowed."
    ),
  idBack: z
    .instanceof(File)
    .optional()
    .refine(
      (file) => !file || file.size <= MAX_FILE_SIZE,
      `Image size exceeds 2MB. Please compress it using [TinyPNG](https://tinypng.com/) and try again.`
    )
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Only JPEG or PNG images are allowed."
    ),
});

type KYCFormValues = z.infer<typeof kycSchema>;

export default function KYCPage() {
  const form = useForm<KYCFormValues>({
    resolver: zodResolver(kycSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      otherName: "",
      sex: "Male",
      address: "",
      nationality: "",
      dob: "",
      maritalStatus: "Single",
      idType: "Passport",
      idFront: undefined,
      idBack: undefined,
    },
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const kycSnap = await getDoc(doc(db, "kyc", user.uid));
      const userSnap = await getDoc(doc(db, "users", user.uid));

      const kycData = kycSnap.exists() ? kycSnap.data() : {};
      const userData = userSnap.exists() ? userSnap.data() : {};

      form.reset({
        email: user.email || "",
        firstName: kycData.firstName || userData.firstName || "",
        lastName: kycData.lastName || userData.lastName || "",
        otherName: kycData.otherName || "",
        sex: kycData.sex || "Male",
        address: kycData.address || "",
        nationality: kycData.nationality || userData.nationality || "",
        dob: kycData.dob || "",
        maritalStatus: kycData.maritalStatus || "Single",
        idType: kycData.idType || "Passport",
        idFront: undefined, // Files can't be pre-populated
        idBack: undefined,
      });

      setLoading(false);
    };

    fetchUserInfo();
  }, [form]);

  const onSubmit = async (data: KYCFormValues) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const storage = getStorage();
      let idFrontUrl = data.idFront ? "" : undefined;
      let idBackUrl = data.idBack ? "" : undefined;

      // Upload front ID if provided
      if (data.idFront) {
        const frontRef = ref(storage, `kyc/${user.uid}/${data.idType}_front`);
        await uploadBytes(frontRef, data.idFront);
        idFrontUrl = await getDownloadURL(frontRef);
      }

      // Upload back ID if provided
      if (data.idBack) {
        const backRef = ref(storage, `kyc/${user.uid}/${data.idType}_back`);
        await uploadBytes(backRef, data.idBack);
        idBackUrl = await getDownloadURL(backRef);
      }

      // Save KYC data to Firestore
      const kycData = {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        otherName: data.otherName,
        sex: data.sex,
        address: data.address,
        nationality: data.nationality,
        dob: data.dob,
        maritalStatus: data.maritalStatus,
        idType: data.idType,
        ...(idFrontUrl && { idFrontUrl }),
        ...(idBackUrl && { idBackUrl }),
      };

      await setDoc(doc(db, "kyc", user.uid), kycData);
      toast.success("KYC updated successfully");
    } catch (error) {
      console.error("KYC submission error:", error);
      toast.error("Failed to update KYC");
    }
  };

  if (loading) return <Loading />;

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="p-6 w-full sm:w-5/6 md:w-3/4 max-w-[600px] mx-auto font-montserrat">
          <Card>
            <CardHeader>
              <CardTitle>Complete Your KYC</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  {[
                    ["email", "Email"],
                    ["firstName", "First Name"],
                    ["lastName", "Last Name"],
                    ["otherName", "Other Name"],
                    ["address", "Address"],
                    ["nationality", "Nationality"],
                    ["dob", "Date of Birth (mm/dd/yyyy)"],
                  ].map(([name, label]) => (
                    <FormField
                      key={name}
                      name={name as keyof KYCFormValues}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{label}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}

                  <FormField
                    name="sex"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sex</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="maritalStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marital Status</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Single">Single</SelectItem>
                            <SelectItem value="Married">Married</SelectItem>
                            <SelectItem value="Divorced">Divorced</SelectItem>
                            <SelectItem value="Widowed">Widowed</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="idType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID Type</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select ID Type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Passport">Passport</SelectItem>
                            <SelectItem value="Driver's License">
                              Driver&apos;s License
                            </SelectItem>
                            <SelectItem value="National ID">
                              National ID
                            </SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="idFront"
                    render={({ field: { onChange, value, ...rest } }) => (
                      <FormItem>
                        <FormLabel>Front of ID</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            accept="image/jpeg,image/png"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              onChange(file);
                            }}
                            {...rest}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="idBack"
                    render={({ field: { onChange, value, ...rest } }) => (
                      <FormItem>
                        <FormLabel>Back of ID</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            accept="image/jpeg,image/png"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              onChange(file);
                            }}
                            {...rest}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full mt-10 hover:bg-white border hover:text-black"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <Spinner />
                        Uploading...
                      </span>
                    ) : (
                      "Update KYC"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
