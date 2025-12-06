// "use client";

// import { useEffect, useState } from "react";
// import {
//   collection,
//   doc,
//   deleteDoc,
//   onSnapshot,
//   updateDoc,
//   setDoc,
// } from "firebase/firestore";
// import { db } from "@/lib/firebase";
// import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
// import { AppSidebar } from "../components/app-sidebar";
// import { SiteHeader } from "../components/site-header";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Label } from "@/components/ui/label";

// // Utility to create a slug from a name
// const slugify = (text: string) =>
//   text
//     .toLowerCase()
//     .replace(/\s+/g, "-")
//     .replace(/[^\w-]+/g, "")
//     .replace(/--+/g, "-")
//     .replace(/^-+|-+$/g, "");

// export default function UpdateSiteDataPage() {
//   const [managers, setManagers] = useState<any[]>([]);
//   const [aiBots, setAiBots] = useState<any[]>([]);
//   const [newManager, setNewManager] = useState<any>({});
//   const [newBot, setNewBot] = useState<any>({});
//   const [editingManagerId, setEditingManagerId] = useState<string | null>(null);
//   const [editedManager, setEditedManager] = useState<any>({});
//   const [editingBotId, setEditingBotId] = useState<string | null>(null);
//   const [editedBot, setEditedBot] = useState<any>({});

//   useEffect(() => {
//     const unsubManagers = onSnapshot(collection(db, "managers"), (snap) =>
//       setManagers(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
//     );
//     const unsubBots = onSnapshot(collection(db, "aiBots"), (snap) =>
//       setAiBots(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
//     );
//     return () => {
//       unsubManagers();
//       unsubBots();
//     };
//   }, []);

//   // Helper function to convert specific fields to numbers
//   const convertToNumbers = (data: any, numericFields: string[]) => {
//     const convertedData = { ...data };
//     numericFields.forEach((field) => {
//       if (convertedData[field] !== undefined && convertedData[field] !== "") {
//         convertedData[field] = Number(convertedData[field]);
//       }
//     });
//     return convertedData;
//   };

//   const handleAdd = async (type: "manager" | "bot") => {
//     const isManager = type === "manager";
//     const data = isManager ? newManager : newBot;

//     // Auto-generate ID from name if not provided
//     const id = data.id?.trim() || slugify(data.name || "");
//     if (!id) {
//       alert("Please enter a name to generate an ID.");
//       return;
//     }

//     // Define numeric fields for each type
//     const numericFields = isManager
//       ? ["investors", "min", "roi", "trades", "winRate"]
//       : ["minInvestment", "maxInvestment", "dailyReturn"];

//     // Convert numeric fields to numbers
//     const convertedData = convertToNumbers(data, numericFields);

//     const ref = doc(db, isManager ? "managers" : "aiBots", id);
//     await setDoc(ref, { ...convertedData, id });

//     if (isManager) {
//       setNewManager({});
//     } else {
//       setNewBot({});
//     }
//   };

//   const handleUpdate = async (
//     id: string,
//     data: any,
//     type: "manager" | "bot"
//   ) => {
//     // Define numeric fields for each type
//     const numericFields =
//       type === "manager"
//         ? ["investors", "min", "roi", "trades", "winRate"]
//         : ["minInvestment", "maxInvestment", "dailyReturn"];

//     // Convert numeric fields to numbers
//     const convertedData = convertToNumbers(data, numericFields);

//     const ref = doc(db, type === "manager" ? "managers" : "aiBots", id);
//     await updateDoc(ref, convertedData);
//   };

//   const handleDelete = async (id: string, type: "manager" | "bot") => {
//     await deleteDoc(doc(db, type === "manager" ? "managers" : "aiBots", id));
//   };

//   const renderLabeledInputs = (
//     data: any,
//     setData: (val: any) => void,
//     fields: { name: string; label: string }[]
//   ) => (
//     <div className="grid md:grid-cols-3 gap-4 my-2">
//       {fields.map(({ name, label }) => (
//         <div key={name} className="space-y-1">
//           <Label className="text-xs text-muted-foreground">{label}</Label>
//           <Input
//             placeholder={name}
//             value={data[name] || ""}
//             onChange={(e) =>
//               setData((prev: any) => ({ ...prev, [name]: e.target.value }))
//             }
//           />
//         </div>
//       ))}
//     </div>
//   );

//   return (
//     <SidebarProvider>
//       <AppSidebar variant="inset" />
//       <SidebarInset>
//         <SiteHeader />
//         <div className="p-6 font-montserrat space-y-10">
//           <h1 className="text-2xl font-bold">Update Site Data</h1>

//           {/* MANAGERS */}
//           <Card className="font-montserrat">
//             <CardHeader>
//               <CardTitle>Managers</CardTitle>
//             </CardHeader>
//             <CardContent>
//               {renderLabeledInputs(newManager, setNewManager, [
//                 { name: "name", label: "Name (string)" },
//                 { name: "img", label: "Image URL (string)" },
//                 { name: "investors", label: "Investors (number)" },
//                 { name: "min", label: "Minimum Investment (number)" },
//                 { name: "roi", label: "ROI% (number)" },
//                 { name: "trades", label: "Trades (number)" },
//                 { name: "winRate", label: "Win Rate (%) (number)" },
//               ])}
//               <Button onClick={() => handleAdd("manager")}>Add Manager</Button>

//               <div className="overflow-x-auto mt-4 font-montserrat">
//                 <table className="min-w-[800px] text-sm border w-full">
//                   <thead>
//                     <tr>
//                       {[
//                         "ID",
//                         "Name",
//                         "Image",
//                         "Investors",
//                         "Min",
//                         "ROI",
//                         "Trades",
//                         "Win Rate",
//                         "Actions",
//                       ].map((h) => (
//                         <th key={h} className="border px-2 py-1 text-left">
//                           {h}
//                         </th>
//                       ))}
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {managers.map((m) => (
//                       <tr key={m.id} className="border font-montserrat">
//                         {[
//                           "id",
//                           "name",
//                           "img",
//                           "investors",
//                           "min",
//                           "roi",
//                           "trades",
//                           "winRate",
//                         ].map((key) => (
//                           <td className="px-2 py-1" key={key}>
//                             {editingManagerId === m.id ? (
//                               <Input
//                                 value={editedManager[key] || ""}
//                                 onChange={(e) =>
//                                   setEditedManager((prev: any) => ({
//                                     ...prev,
//                                     [key]: e.target.value,
//                                   }))
//                                 }
//                               />
//                             ) : (
//                               m[key]
//                             )}
//                           </td>
//                         ))}
//                         <td className="px-2 py-1 space-x-2 flex">
//                           {editingManagerId === m.id ? (
//                             <>
//                               <Button
//                                 size="sm"
//                                 onClick={() => {
//                                   handleUpdate(m.id, editedManager, "manager");
//                                   setEditingManagerId(null);
//                                 }}
//                               >
//                                 Save
//                               </Button>
//                               <Button
//                                 size="sm"
//                                 variant="ghost"
//                                 onClick={() => setEditingManagerId(null)}
//                               >
//                                 Cancel
//                               </Button>
//                             </>
//                           ) : (
//                             <>
//                               <Button
//                                 size="sm"
//                                 variant="outline"
//                                 onClick={() => {
//                                   setEditingManagerId(m.id);
//                                   setEditedManager(m);
//                                 }}
//                               >
//                                 Edit
//                               </Button>
//                               <Button
//                                 size="sm"
//                                 variant="destructive"
//                                 onClick={() => handleDelete(m.id, "manager")}
//                               >
//                                 Delete
//                               </Button>
//                             </>
//                           )}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </CardContent>
//           </Card>

//           {/* AI BOTS */}
//           <Card className="font-montserrat">
//             <CardHeader>
//               <CardTitle>AI Bots</CardTitle>
//             </CardHeader>
//             <CardContent>
//               {renderLabeledInputs(newBot, setNewBot, [
//                 { name: "name", label: "Name (string)" },
//                 { name: "details", label: "Details (string)" },
//                 { name: "investmentRange", label: "Investment Range (string)" },
//                 { name: "minInvestment", label: "Min Investment (number)" },
//                 { name: "maxInvestment", label: "Max Investment (number)" },
//                 { name: "dailyReturn", label: "Daily Return (%) (number)" },
//               ])}
//               <Button onClick={() => handleAdd("bot")}>Add AI Bot</Button>

//               <div className="overflow-x-auto mt-4">
//                 <table className="min-w-[800px] text-sm border">
//                   <thead>
//                     <tr>
//                       {[
//                         "ID",
//                         "Name",
//                         "Details",
//                         "Investment Range",
//                         "Min Investment",
//                         "Max Investment",
//                         "Daily Return",
//                         "Actions",
//                       ].map((h) => (
//                         <th key={h} className="border px-2 py-1 text-left">
//                           {h}
//                         </th>
//                       ))}
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {aiBots.map((b) => (
//                       <tr key={b.id} className="border">
//                         {[
//                           "id",
//                           "name",
//                           "details",
//                           "investmentRange",
//                           "minInvestment",
//                           "maxInvestment",
//                           "dailyReturn",
//                         ].map((key) => (
//                           <td className="px-2 py-1" key={key}>
//                             {editingBotId === b.id ? (
//                               <Input
//                                 value={editedBot[key] || ""}
//                                 onChange={(e) =>
//                                   setEditedBot((prev: any) => ({
//                                     ...prev,
//                                     [key]: e.target.value,
//                                   }))
//                                 }
//                               />
//                             ) : (
//                               b[key]
//                             )}
//                           </td>
//                         ))}
//                         <td className="px-2 py-1 space-x-2 flex">
//                           {editingBotId === b.id ? (
//                             <>
//                               <Button
//                                 size="sm"
//                                 onClick={() => {
//                                   handleUpdate(b.id, editedBot, "bot");
//                                   setEditingBotId(null);
//                                 }}
//                               >
//                                 Save
//                               </Button>
//                               <Button
//                                 size="sm"
//                                 variant="ghost"
//                                 onClick={() => setEditingBotId(null)}
//                               >
//                                 Cancel
//                               </Button>
//                             </>
//                           ) : (
//                             <>
//                               <Button
//                                 size="sm"
//                                 variant="outline"
//                                 onClick={() => {
//                                   setEditingBotId(b.id);
//                                   setEditedBot(b);
//                                 }}
//                               >
//                                 Edit
//                               </Button>
//                               <Button
//                                 size="sm"
//                                 variant="destructive"
//                                 onClick={() => handleDelete(b.id, "bot")}
//                               >
//                                 Delete
//                               </Button>
//                             </>
//                           )}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </SidebarInset>
//     </SidebarProvider>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import {
  collection,
  doc,
  deleteDoc,
  onSnapshot,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "../components/app-sidebar";
import { SiteHeader } from "../components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

// Utility to create a slug from a name
const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");

type Manager = {
  id: string;
  name: string;
  img?: string;
  investors: number;
  min: number;
  roi: number;
  trades: number;
  winRate: number;
  "money-back": number; // Money-back period in days
};

type Bot = {
  id: string;
  name: string;
  details?: string;
  investmentRange?: string;
  minInvestment: number;
  maxInvestment: number;
  dailyReturn: number;
  "money-back": number; // Money-back period in days
};

export default function UpdateSiteDataPage() {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [aiBots, setAiBots] = useState<Bot[]>([]);
  const [newManager, setNewManager] = useState<Partial<Manager>>({});
  const [newBot, setNewBot] = useState<Partial<Bot>>({});
  const [editingManagerId, setEditingManagerId] = useState<string | null>(null);
  const [editedManager, setEditedManager] = useState<Partial<Manager>>({});
  const [editingBotId, setEditingBotId] = useState<string | null>(null);
  const [editedBot, setEditedBot] = useState<Partial<Bot>>({});

  useEffect(() => {
    const unsubManagers = onSnapshot(collection(db, "managers"), (snap) =>
      setManagers(
        snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Manager))
      )
    );
    const unsubBots = onSnapshot(collection(db, "aiBots"), (snap) =>
      setAiBots(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Bot)))
    );
    return () => {
      unsubManagers();
      unsubBots();
    };
  }, []);

  // Helper function to convert specific fields to numbers
  const convertToNumbers = (data: any, numericFields: string[]) => {
    const convertedData = { ...data };
    numericFields.forEach((field) => {
      if (convertedData[field] !== undefined && convertedData[field] !== "") {
        convertedData[field] = Number(convertedData[field]);
      }
    });
    return convertedData;
  };

  const handleAdd = async (type: "manager" | "bot") => {
    const isManager = type === "manager";
    const data = isManager ? newManager : newBot;

    // Auto-generate ID from name if not provided
    const id = data.id?.trim() || slugify(data.name || "");
    if (!id) {
      alert("Please enter a name to generate an ID.");
      return;
    }

    // Define numeric fields for each type
    const numericFields = isManager
      ? ["investors", "min", "roi", "trades", "winRate", "money-back"]
      : ["minInvestment", "maxInvestment", "dailyReturn", "money-back"];

    // Convert numeric fields to numbers
    const convertedData = convertToNumbers(data, numericFields);

    const ref = doc(db, isManager ? "managers" : "aiBots", id);
    await setDoc(ref, { ...convertedData, id });

    if (isManager) {
      setNewManager({});
    } else {
      setNewBot({});
    }
  };

  const handleUpdate = async (
    id: string,
    data: any,
    type: "manager" | "bot"
  ) => {
    // Define numeric fields for each type
    const numericFields =
      type === "manager"
        ? ["investors", "min", "roi", "trades", "winRate", "money-back"]
        : ["minInvestment", "maxInvestment", "dailyReturn", "money-back"];

    // Convert numeric fields to numbers
    const convertedData = convertToNumbers(data, numericFields);

    const ref = doc(db, type === "manager" ? "managers" : "aiBots", id);
    await updateDoc(ref, convertedData);
  };

  const handleDelete = async (id: string, type: "manager" | "bot") => {
    await deleteDoc(doc(db, type === "manager" ? "managers" : "aiBots", id));
  };

  const renderLabeledInputs = (
    data: any,
    setData: (val: any) => void,
    fields: { name: string; label: string }[]
  ) => (
    <div className="grid md:grid-cols-3 gap-4 my-2">
      {fields.map(({ name, label }) => (
        <div key={name} className="space-y-1">
          <Label className="text-xs text-muted-foreground">{label}</Label>
          <Input
            placeholder={name}
            value={data[name] || ""}
            onChange={(e) =>
              setData((prev: any) => ({ ...prev, [name]: e.target.value }))
            }
          />
        </div>
      ))}
    </div>
  );

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="p-6 font-montserrat space-y-10">
          <h1 className="text-2xl font-bold">Update Site Data</h1>

          {/* MANAGERS */}
          <Card className="font-montserrat">
            <CardHeader>
              <CardTitle>Managers</CardTitle>
            </CardHeader>
            <CardContent>
              {renderLabeledInputs(newManager, setNewManager, [
                { name: "name", label: "Name (string)" },
                { name: "img", label: "Image URL (string)" },
                { name: "investors", label: "Investors (number)" },
                { name: "min", label: "Minimum Investment (number)" },
                { name: "roi", label: "ROI% (number)" },
                { name: "trades", label: "Trades (number)" },
                { name: "winRate", label: "Win Rate (%) (number)" },
                {
                  name: "money-back",
                  label: "Money-Back Period (days) (number)",
                },
              ])}
              <Button onClick={() => handleAdd("manager")}>Add Manager</Button>

              <div className="overflow-x-auto mt-4 font-montserrat">
                <table className="min-w-[800px] text-sm border w-full">
                  <thead>
                    <tr>
                      {[
                        "ID",
                        "Name",
                        "Image",
                        "Investors",
                        "Min",
                        "ROI",
                        "Trades",
                        "Win Rate",
                        "Money-Back",
                        "Actions",
                      ].map((h) => (
                        <th key={h} className="border px-2 py-1 text-left">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {managers.map((m) => (
                      <tr key={m.id} className="border font-montserrat">
                        {[
                          "id",
                          "name",
                          "img",
                          "investors",
                          "min",
                          "roi",
                          "trades",
                          "winRate",
                          "money-back",
                        ].map((key) => (
                          <td className="px-2 py-1" key={key}>
                            {editingManagerId === m.id ? (
                              <Input
                                // @ts-ignore
                                value={editedManager[key] || ""}
                                onChange={(e) =>
                                  setEditedManager((prev: any) => ({
                                    ...prev,
                                    [key]: e.target.value,
                                  }))
                                }
                              />
                            ) : (
                              // @ts-ignore
                              m[key] || "N/A"
                            )}
                          </td>
                        ))}
                        <td className="px-2 py-1 space-x-2 flex">
                          {editingManagerId === m.id ? (
                            <>
                              <Button
                                size="sm"
                                onClick={() => {
                                  handleUpdate(m.id, editedManager, "manager");
                                  setEditingManagerId(null);
                                }}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingManagerId(null)}
                              >
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingManagerId(m.id);
                                  setEditedManager(m);
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(m.id, "manager")}
                              >
                                Delete
                              </Button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* AI BOTS */}
          <Card className="font-montserrat">
            <CardHeader>
              <CardTitle>AI Bots</CardTitle>
            </CardHeader>
            <CardContent>
              {renderLabeledInputs(newBot, setNewBot, [
                { name: "name", label: "Name (string)" },
                { name: "details", label: "Details (string)" },
                { name: "investmentRange", label: "Investment Range (string)" },
                { name: "minInvestment", label: "Min Investment (number)" },
                { name: "maxInvestment", label: "Max Investment (number)" },
                { name: "dailyReturn", label: "Daily Return (%) (number)" },
                {
                  name: "money-back",
                  label: "Money-Back Period (days) (number)",
                },
              ])}
              <Button onClick={() => handleAdd("bot")}>Add AI Bot</Button>

              <div className="overflow-x-auto mt-4">
                <table className="min-w-[800px] text-sm border">
                  <thead>
                    <tr>
                      {[
                        "ID",
                        "Name",
                        "Details",
                        "Investment Range",
                        "Min Investment",
                        "Max Investment",
                        "Daily Return",
                        "Money-Back",
                        "Actions",
                      ].map((h) => (
                        <th key={h} className="border px-2 py-1 text-left">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {aiBots.map((b) => (
                      <tr key={b.id} className="border">
                        {[
                          "id",
                          "name",
                          "details",
                          "investmentRange",
                          "minInvestment",
                          "maxInvestment",
                          "dailyReturn",
                          "money-back",
                        ].map((key) => (
                          <td className="px-2 py-1" key={key}>
                            {editingBotId === b.id ? (
                              <Input
                                // @ts-ignore
                                value={editedBot[key] || ""}
                                onChange={(e) =>
                                  setEditedBot((prev: any) => ({
                                    ...prev,
                                    [key]: e.target.value,
                                  }))
                                }
                              />
                            ) : (
                              // @ts-ignore
                              b[key] || "N/A"
                            )}
                          </td>
                        ))}
                        <td className="px-2 py-1 space-x-2 flex">
                          {editingBotId === b.id ? (
                            <>
                              <Button
                                size="sm"
                                onClick={() => {
                                  handleUpdate(b.id, editedBot, "bot");
                                  setEditingBotId(null);
                                }}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingBotId(null)}
                              >
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingBotId(b.id);
                                  setEditedBot(b);
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleDelete(b.id, "bot")}
                                variant="destructive"
                              >
                                Delete
                              </Button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
