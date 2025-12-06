// // // components/WithdrawalPopup.tsx
// // "use client";

// // import { motion, AnimatePresence } from "framer-motion";

// // interface Props {
// //   message: string;
// //   visible: boolean;
// // }

// // export default function WithdrawalPopup({ message, visible }: Props) {
// //   return (
// //     <AnimatePresence>
// //       {visible && (
// //         <motion.div
// //           className="fixed bottom-6 left-1/2 transform -translate-x-1/2 backdrop-blur-lg text-white px-6 py-3 rounded-lg shadow-lg z-50"
// //           initial={{ opacity: 0, y: 50 }}
// //           animate={{ opacity: 1, y: 0 }}
// //           exit={{ opacity: 0, y: 50 }}
// //           transition={{ duration: 0.5 }}
// //         >
// //           {message}
// //         </motion.div>
// //       )}
// //     </AnimatePresence>
// //   );
// // }

// // components/WithdrawalPopup.tsx
// "use client";

// import { motion, AnimatePresence } from "framer-motion";

// interface Props {
//   message: string;
//   visible: boolean;
// }

// export default function WithdrawalPopup({ message, visible }: Props) {
//   return (
//     <AnimatePresence>
//       {visible && (
//         <motion.div
//           className="fixed bottom-6 left-4 w-3/4 md:w-auto md:left-6 md:max-w-sm backdrop-blur-lg text-white px-6 py-3 rounded-lg shadow-lg z-50 font-montserrat"
//           initial={{ opacity: 0, y: 50 }}
//           animate={{ opacity: 1, y: 0 }}
//           exit={{ opacity: 0, y: 50 }}
//           transition={{ duration: 0.5 }}
//         >
//           {message}
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// }

// components/WithdrawalPopup.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";

interface Props {
  message: string;
  visible: boolean;
}

export default function WithdrawalPopup({ message, visible }: Props) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed bottom-6 right-4 w-3/4 md:w-auto md:right-6 md:max-w-sm backdrop-blur-lg text-white px-6 py-3 rounded-lg shadow-lg z-50 font-montserrat"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.5 }}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
