import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CategoryShowcase = ({ categories }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const activeCategory = categories[activeIndex];

  return (
    <div className="relative w-full overflow-hidden rounded-3xl">
      {/* --- Background Layer (Animated) --- */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${activeCategory.bgImageUrl})` }}
        ></motion.div>
      </AnimatePresence>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/25"></div>

      {/* --- Content Layer --- */}
      <div className="relative z-10 px-6 md:px-12 py-14">

        {/* Tabs */}
        <div className="flex justify-center space-x-6 mb-10">
          {categories.map((cat, idx) => (
            <button
              key={cat.id}
              onClick={() => setActiveIndex(idx)}
              className={`
                text-lg font-semibold transition-all pb-1
                ${idx === activeIndex
                  ? "text-white border-b-2 border-white"
                  : "text-gray-300 hover:text-white"}
              `}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6 drop-shadow-lg">
          {activeCategory.name}
        </h2>

        {/* --- Animated Product List --- */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory.id + "-products"}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.45 }}
            className="overflow-x-auto"
          >
            <div className="flex space-x-6 pb-4">
              {activeCategory.products.map((prod) => (
                <a
                  key={prod.id}
                  href={prod.viewLink}
                  className="
                    min-w-[200px] flex-shrink-0 bg-white/90 rounded-xl 
                    shadow-md hover:shadow-xl transition-shadow p-4 backdrop-blur-sm
                  "
                >
                  <div className="w-full h-40 overflow-hidden rounded-lg mb-3">
                    <img
                      src={prod.imageUrl}
                      alt={prod.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="text-sm font-medium text-gray-800">{prod.name}</h4>
                  <p className="text-base font-bold text-gray-900 mt-1">{prod.price}</p>
                </a>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* View More button */}
        <div className="mt-6 text-center">
          <a
            href={activeCategory.viewAllLink}
            className="px-6 py-2.5 rounded-lg bg-white/90 text-gray-900 font-semibold shadow hover:bg-white transition"
          >
            View More
          </a>
        </div>
      </div>
    </div>
  );
};

export default CategoryShowcase;
