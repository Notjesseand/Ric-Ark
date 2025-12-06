// "use client";

// import React, { useEffect, useState, useRef } from "react";
// import {
//   Carousel,
//   CarouselContent,
//   CarouselItem,
//   CarouselNext,
//   CarouselPrevious,
// } from "@/components/ui/carousel";
// import Autoplay from "embla-carousel-autoplay";
// import Spinner from "../spinner";

// export function MarketCarousel() {
//   const [data, setData] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);

//   const plugin = useRef(
//     Autoplay(
//       { delay: 2000, stopOnInteraction: false },
//       //@ts-ignore
//       (emblaRoot: any) => emblaRoot.parentElement // embla target root
//     )
//   );
//   const autoplay2 = useRef(
//     Autoplay(
//       { delay: 2000, stopOnInteraction: false },
//       //@ts-ignore
//       (emblaRoot: any) => emblaRoot.parentElement // embla target root
//     )
//   );
//   const autoplay3 = useRef(
//     Autoplay(
//       { delay: 2000, stopOnInteraction: false },
//       //@ts-ignore
//       (emblaRoot: any) => emblaRoot.parentElement // embla target root
//     )
//   );

//   const handleMouseEnter = () => {
//     plugin.current?.stop();
//   };

//   const handleMouseLeave = () => {
//     plugin.current?.play(); // ✅ This resumes autoplay properly
//   };

//   async function getData() {
//     try {
//       const res = await fetch(
//         "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false"
//       );
//       const json = await res.json();
//       setData(json);
//     } catch (err) {
//       console.error("Error fetching data:", err);
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     getData();
//   }, []);

//   return (
//     <div className="pt-4 md:px-10">
//       {loading ? (
//         <div className="flex justify-center items-center h-40">
//           <Spinner />
//         </div>
//       ) : (
//         <div>
//           <Carousel
//             className="w-full"
//             onMouseEnter={handleMouseEnter}
//             onMouseLeave={handleMouseLeave}
//             plugins={[plugin.current]}
//           >
//             <CarouselContent>
//               {data.slice(0, 20).map((item: any, index: number) => (
//                 <CarouselItem
//                   key={item.id}
//                   className="  basis-1/3  sm:basis-1/3 md:basis-1/4 lg:basis-1/6 font-montserrat"
//                 >
//                   <div className="sm:flex items-center gap-2 justify-center text-center sm:text-start">
//                     <p
//                       className={`${
//                         item.id.length > 14 ? "text-sm" : ""
//                       } text-sm truncate max-w-[100%]`}
//                     >
//                       {item.id}
//                     </p>
//                     <img
//                       src={item.image}
//                       alt=""
//                       className="h-4 sm:h-6 mt-1 mx-auto sm:mx-0"
//                     />
//                   </div>
//                   <div className="text-center text-sm">
//                     <p className="font-semibold">
//                       ${item.current_price.toLocaleString()}
//                     </p>
//                     <p
//                       className={`mt-2 truncate max-w-[100%] ${
//                         item.price_change_percentage_24h > 0
//                           ? "text-green-500"
//                           : "text-red-500"
//                       }`}
//                     >
//                       <span className="text-[11px] text-black font-semibold">
//                         {" "}
//                         24hrs:
//                       </span>{" "}
//                       {item.price_change_percentage_24h > 0 ? "+" : ""}
//                       {item.price_change_percentage_24h}
//                     </p>
//                   </div>
//                 </CarouselItem>
//               ))}
//             </CarouselContent>
//             <CarouselPrevious className="ml-4 sm:ml-0 flex" />
//             <CarouselNext className="mr-4 sm:mr-0 flex" />
//           </Carousel>

//           {/* row 2 */}

//           <Carousel
//             className="w-full pt-10"
//             onMouseEnter={() => autoplay2.current?.stop()}
//             onMouseLeave={() => autoplay2.current?.play()}
//             plugins={[autoplay2.current]}
//           >
//             <CarouselContent>
//               {data.slice(20, 40).map((item: any, index: number) => (
//                 <CarouselItem
//                   key={item.id}
//                   className="  basis-1/3  sm:basis-1/3 md:basis-1/4 lg:basis-1/6 font-montserrat"
//                 >
//                   <div className="sm:flex items-center gap-2 justify-center text-center sm:text-start text-xs">
//                     <p
//                       className={`${
//                         item.id.length > 14 ? "text-sm" : ""
//                       } text-sm truncate max-w-[100%]`}
//                     >
//                       {item.id}
//                     </p>
//                     <img
//                       src={item.image}
//                       alt=""
//                       className="h-4 sm:h-6 mt-1 mx-auto sm:mx-0"
//                     />
//                   </div>
//                   <div className="text-center text-sm">
//                     <p className="font-semibold">
//                       ${item.current_price.toLocaleString()}
//                     </p>
//                     <p
//                       className={`mt-2 truncate max-w-[100%] ${
//                         item.price_change_percentage_24h > 0
//                           ? "text-green-500"
//                           : "text-red-500"
//                       }`}
//                     >
//                       <span className="text-[11px] text-black font-semibold">
//                         {" "}
//                         24hrs:
//                       </span>{" "}
//                       {item.price_change_percentage_24h}
//                     </p>
//                   </div>
//                 </CarouselItem>
//               ))}
//             </CarouselContent>
//             <CarouselPrevious className="ml-4 sm:ml-0 flex" />
//             <CarouselNext className="mr-4 sm:mr-0 flex" />
//           </Carousel>

//           {/* row 3 */}
//           <Carousel
//             className="w-full pt-10"
//             onMouseEnter={() => autoplay3.current?.stop()}
//             onMouseLeave={() => autoplay3.current?.play()}
//             plugins={[autoplay3.current]}
//           >
//             <CarouselContent>
//               {data.slice(40, 100).map((item: any, index: number) => (
//                 <CarouselItem
//                   key={item.id}
//                   className="  basis-1/3  sm:basis-1/3 md:basis-1/4 lg:basis-1/6 font-montserrat"
//                 >
//                   <div className="sm:flex items-center gap-2 justify-center text-center sm:text-start">
//                     <p
//                       className={`${
//                         item.id.length > 14 ? "text-sm" : ""
//                       } text-sm truncate max-w-[100%]`}
//                     >
//                       {item.id}
//                     </p>
//                     <img
//                       src={item.image}
//                       alt=""
//                       className="h-4 sm:h-6 mt-1 mx-auto sm:mx-0"
//                     />
//                   </div>
//                   <div className="text-center text-sm">
//                     <p className="font-semibold">
//                       ${item.current_price.toLocaleString()}
//                     </p>
//                     <p
//                       className={`mt-2 truncate max-w-[100%] ${
//                         item.price_change_percentage_24h > 0
//                           ? "text-green-500"
//                           : "text-red-500"
//                       }`}
//                     >
//                       <span className="text-[11px] text-black font-semibold">
//                         {" "}
//                         24hrs:
//                       </span>{" "}
//                       {item.price_change_percentage_24h}
//                     </p>
//                   </div>
//                 </CarouselItem>
//               ))}
//             </CarouselContent>
//             <CarouselPrevious className="ml-4 sm:ml-0 flex" />
//             <CarouselNext className="mr-4 sm:mr-0 flex" />
//           </Carousel>
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import Spinner from "../spinner";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

// Cache configuration
const CACHE_KEY = "marketCarouselData";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Cache helper functions
const getCachedData = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_DURATION) return data;
    localStorage.removeItem(CACHE_KEY);
    return null;
  } catch (err) {
    console.error("Error reading cache:", err);
    return null;
  }
};

const setCachedData = (data: any) => {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ data, timestamp: Date.now() })
    );
  } catch (err) {
    console.error("Error writing to cache:", err);
  }
};

export function MarketCarousel() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const plugin = useRef(Autoplay({ delay: 2000, stopOnInteraction: false }));
  const autoplay2 = useRef(Autoplay({ delay: 2000, stopOnInteraction: false }));
  const autoplay3 = useRef(Autoplay({ delay: 2000, stopOnInteraction: false }));

  const handleMouseEnter = () => {
    plugin.current?.stop();
  };

  const handleMouseLeave = () => {
    plugin.current?.play();
  };

  const getData = async () => {
    setLoading(true);
    setError(null);

    const cachedData = getCachedData();
    if (cachedData) {
      setData(cachedData);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false"
      );
      if (!res.ok) {
        if (res.status === 429) {
          throw new Error("Rate limit exceeded. Please try again later.");
        }
        throw new Error(`HTTP error: ${res.status}`);
      }
      const json = await res.json();
      if (!Array.isArray(json) || json.length === 0) {
        throw new Error("Invalid or empty data received.");
      }
      setData(json);
      setCachedData(json);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch market data.");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    // <div className="pt-4 md:px-10">
    //   <div className="flex justify-end mb-2">
    //     <Button
    //       variant="outline"
    //       size="sm"
    //       onClick={getData}
    //       disabled={loading}
    //       className="font-montserrat flex items-center gap-1 mb-3"
    //     >
    //       <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
    //       Refresh
    //     </Button>
    //   </div>
    //   {loading ? (
    //     <div className="flex justify-center items-center h-40">
    //       <Spinner />
    //     </div>
    //   ) : error ? (
    //     <div className="flex justify-center items-center h-40 font-montserrat text-red-500">
    //       <p>{error}</p>
    //     </div>
    //   ) : (
    //     <div>
    //       <Carousel
    //         className="w-full"
    //         onMouseEnter={handleMouseEnter}
    //         onMouseLeave={handleMouseLeave}
    //         plugins={[plugin.current]}
    //       >
    //         <CarouselContent>
    //           {data.slice(0, 20).map((item: any, index: number) => (
    //             <CarouselItem
    //               key={item.id}
    //               className="basis-1/3 sm:basis-1/3 md:basis-1/4 lg:basis-1/6 font-montserrat"
    //             >
    //               <div className="sm:flex items-center gap-2 justify-center text-center sm:text-start">
    //                 <p
    //                   className={`${
    //                     item.id.length > 14 ? "text-sm" : ""
    //                   } text-sm truncate max-w-[100%]`}
    //                 >
    //                   {item.id}
    //                 </p>
    //                 <img
    //                   src={item.image}
    //                   alt={`${item.id} logo`}
    //                   className="h-4 sm:h-6 mt-1 mx-auto sm:mx-0"
    //                 />
    //               </div>
    //               <div className="text-center text-sm">
    //                 <p className="font-semibold">
    //                   ${item.current_price.toLocaleString()}
    //                 </p>
    //                 <p
    //                   className={`mt-2 truncate max-w-[100%] ${
    //                     item.price_change_percentage_24h > 0
    //                       ? "text-green-500"
    //                       : "text-red-500"
    //                   }`}
    //                 >
    //                   <span className="text-[11px] text-black font-semibold">
    //                     24hrs:
    //                   </span>{" "}
    //                   {item.price_change_percentage_24h > 0 ? "+" : ""}
    //                   {item.price_change_percentage_24h.toFixed(2)}%
    //                 </p>
    //               </div>
    //             </CarouselItem>
    //           ))}
    //         </CarouselContent>
    //         <CarouselPrevious className="ml-4 sm:ml-0 flex" />
    //         <CarouselNext className="mr-4 sm:mr-0 flex" />
    //       </Carousel>

    //       <Carousel
    //         className="w-full pt-10"
    //         onMouseEnter={() => autoplay2.current?.stop()}
    //         onMouseLeave={() => autoplay2.current?.play()}
    //         plugins={[autoplay2.current]}
    //       >
    //         <CarouselContent>
    //           {data.slice(20, 40).map((item: any, index: number) => (
    //             <CarouselItem
    //               key={item.id}
    //               className="basis-1/3 sm:basis-1/3 md:basis-1/4 lg:basis-1/6 font-montserrat"
    //             >
    //               <div className="sm:flex items-center gap-2 justify-center text-center sm:text-start text-xs">
    //                 <p
    //                   className={`${
    //                     item.id.length > 14 ? "text-sm" : ""
    //                   } text-sm truncate max-w-[100%]`}
    //                 >
    //                   {item.id}
    //                 </p>
    //                 <img
    //                   src={item.image}
    //                   alt={`${item.id} logo`}
    //                   className="h-4 sm:h-6 mt-1 mx-auto sm:mx-0"
    //                 />
    //               </div>
    //               <div className="text-center text-sm">
    //                 <p className="font-semibold">
    //                   ${item.current_price.toLocaleString()}
    //                 </p>
    //                 <p
    //                   className={`mt-2 truncate max-w-[100%] ${
    //                     item.price_change_percentage_24h > 0
    //                       ? "text-green-500"
    //                       : "text-red-500"
    //                   }`}
    //                 >
    //                   <span className="text-[11px] text-black font-semibold">
    //                     24hrs:
    //                   </span>{" "}
    //                   {item.price_change_percentage_24h > 0 ? "+" : ""}
    //                   {item.price_change_percentage_24h.toFixed(2)}%
    //                 </p>
    //               </div>
    //             </CarouselItem>
    //           ))}
    //         </CarouselContent>
    //         <CarouselPrevious className="ml-4 sm:ml-0 flex" />
    //         <CarouselNext className="mr-4 sm:mr-0 flex" />
    //       </Carousel>

    //       <Carousel
    //         className="w-full pt-10"
    //         onMouseEnter={() => autoplay3.current?.stop()}
    //         onMouseLeave={() => autoplay3.current?.play()}
    //         plugins={[autoplay3.current]}
    //       >
    //         <CarouselContent>
    //           {data.slice(40, 100).map((item: any, index: number) => (
    //             <CarouselItem
    //               key={item.id}
    //               className="basis-1/3 sm:basis-1/3 md:basis-1/4 lg:basis-1/6 font-montserrat"
    //             >
    //               <div className="sm:flex items-center gap-2 justify-center text-center sm:text-start">
    //                 <p
    //                   className={`${
    //                     item.id.length > 14 ? "text-sm" : ""
    //                   } text-sm truncate max-w-[100%]`}
    //                 >
    //                   {item.id}
    //                 </p>
    //                 <img
    //                   src={item.image}
    //                   alt={`${item.id} logo`}
    //                   className="h-4 sm:h-6 mt-1 mx-auto sm:mx-0"
    //                 />
    //               </div>
    //               <div className="text-center text-sm">
    //                 <p className="font-semibold">
    //                   ${item.current_price.toLocaleString()}
    //                 </p>
    //                 <p
    //                   className={`mt-2 truncate max-w-[100%] ${
    //                     item.price_change_percentage_24h > 0
    //                       ? "text-green-500"
    //                       : "text-red-500"
    //                   }`}
    //                 >
    //                   <span className="text-[11px] text-black font-semibold">
    //                     24hrs:
    //                   </span>{" "}
    //                   {item.price_change_percentage_24h > 0 ? "+" : ""}
    //                   {item.price_change_percentage_24h.toFixed(2)}%
    //                 </p>
    //               </div>
    //             </CarouselItem>
    //           ))}
    //         </CarouselContent>
    //         <CarouselPrevious className="ml-4 sm:ml-0 flex" />
    //         <CarouselNext className="mr-4 sm:mr-0 flex" />
    //       </Carousel>
    //     </div>
    //   )}
    // </div>
    <div className="pt-4 md:px-10">
      <div className="flex justify-end mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={getData}
          disabled={loading}
          className="font-montserrat flex items-center gap-1"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Spinner />
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-40 font-montserrat text-red-500">
          <p>{error}</p>
        </div>
      ) : (
        <div className="space-y-6">
          <Carousel
            className="w-full"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            plugins={[plugin.current]}
          >
            <CarouselContent>
              {data.slice(0, 20).map((item: any, index: number) => (
                <CarouselItem
                  key={item.id}
                  className="basis-1/3 sm:basis-1/3 md:basis-1/4 lg:basis-1/6 font-montserrat"
                >
                  <div className="sm:flex items-center gap-2 justify-center text-center sm:text-start">
                    <p
                      className={`${
                        item.id.length > 14 ? "text-sm" : ""
                      } text-sm truncate max-w-[100%]`}
                    >
                      {item.id}
                    </p>
                    <img
                      src={item.image}
                      alt={`${item.id} logo`}
                      className="h-4 sm:h-6 mt-1 mx-auto sm:mx-0"
                    />
                  </div>
                  <div className="text-center text-sm">
                    <p className="font-semibold">
                      ${item.current_price.toLocaleString()}
                    </p>
                    <p
                      className={`mt-2 truncate max-w-[100%] ${
                        item.price_change_percentage_24h > 0
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      <span className="text-[11px] text-black font-semibold">
                        24hrs:
                      </span>{" "}
                      {item.price_change_percentage_24h > 0 ? "+" : ""}
                      {item.price_change_percentage_24h.toFixed(2)}%
                    </p>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="ml-4 sm:ml-0 flex" />
            <CarouselNext className="mr-4 sm:mr-0 flex" />
          </Carousel>

          <Carousel
            className="w-full"
            onMouseEnter={() => autoplay2.current?.stop()}
            onMouseLeave={() => autoplay2.current?.play()}
            plugins={[autoplay2.current]}
          >
            <CarouselContent>
              {data.slice(20, 40).map((item: any, index: number) => (
                <CarouselItem
                  key={item.id}
                  className="basis-1/3 sm:basis-1/3 md:basis-1/4 lg:basis-1/6 font-montserrat"
                >
                  <div className="sm:flex items-center gap-2 justify-center text-center sm:text-start text-xs">
                    <p
                      className={`${
                        item.id.length > 14 ? "text-sm" : ""
                      } text-sm truncate max-w-[100%]`}
                    >
                      {item.id}
                    </p>
                    <img
                      src={item.image}
                      alt={`${item.id} logo`}
                      className="h-4 sm:h-6 mt-1 mx-auto sm:mx-0"
                    />
                  </div>
                  <div className="text-center text-sm">
                    <p className="font-semibold">
                      ${item.current_price.toLocaleString()}
                    </p>
                    <p
                      className={`mt-2 truncate max-w-[100%] ${
                        item.price_change_percentage_24h > 0
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      <span className="text-[11px] text-black font-semibold">
                        24hrs:
                      </span>{" "}
                      {item.price_change_percentage_24h > 0 ? "+" : ""}
                      {item.price_change_percentage_24h.toFixed(2)}%
                    </p>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="ml-4 sm:ml-0 flex" />
            <CarouselNext className="mr-4 sm:mr-0 flex" />
          </Carousel>

          <Carousel
            className="w-full"
            onMouseEnter={() => autoplay3.current?.stop()}
            onMouseLeave={() => autoplay3.current?.play()}
            plugins={[autoplay3.current]}
          >
            <CarouselContent>
              {data.slice(40, 100).map((item: any, index: number) => (
                <CarouselItem
                  key={item.id}
                  className="basis-1/3 sm:basis-1/3 md:basis-1/4 lg:basis-1/6 font-montserrat"
                >
                  <div className="sm:flex items-center gap-2 justify-center text-center sm:text-start">
                    <p
                      className={`${
                        item.id.length > 14 ? "text-sm" : ""
                      } text-sm truncate max-w-[100%]`}
                    >
                      {item.id}
                    </p>
                    <img
                      src={item.image}
                      alt={`${item.id} logo`}
                      className="h-4 sm:h-6 mt-1 mx-auto sm:mx-0"
                    />
                  </div>
                  <div className="text-center text-sm">
                    <p className="font-semibold">
                      ${item.current_price.toLocaleString()}
                    </p>
                    <p
                      className={`mt-2 truncate max-w-[100%] ${
                        item.price_change_percentage_24h > 0
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      <span className="text-[11px] text-black font-semibold">
                        24hrs:
                      </span>{" "}
                      {item.price_change_percentage_24h > 0 ? "+" : ""}
                      {item.price_change_percentage_24h.toFixed(2)}%
                    </p>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="ml-4 sm:ml-0 flex" />
            <CarouselNext className="mr-4 sm:mr-0 flex" />
          </Carousel>
        </div>
      )}
    </div>
  );
}
