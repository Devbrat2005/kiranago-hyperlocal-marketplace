import React from 'react';

const categoryImages = {
  'Grocery': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60',
  'Atta & Flour': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60',
  'Rice & Grains': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=60',
  'Dal & Pulses': 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=500&auto=format&fit=crop&q=60',
  'Oil & Ghee': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=60',
  'Spices & Masala': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&auto=format&fit=crop&q=60',
  'Dairy & Eggs': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=500&auto=format&fit=crop&q=60',
  'Fruits': 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=500&auto=format&fit=crop&q=60',
  'Vegetables': 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=500&auto=format&fit=crop&q=60',
  'Bread & Bakery': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60',
  'Biscuits': 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500&auto=format&fit=crop&q=60',
  'Chocolates': 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=500&auto=format&fit=crop&q=60',
  'Chips & Snacks': 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&auto=format&fit=crop&q=60',
  'Tea & Coffee': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=60',
  'Cold Drinks': 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=60',
  'Packaged Food': 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=500&auto=format&fit=crop&q=60',
  'Instant Food': 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=500&auto=format&fit=crop&q=60',
  'Personal Care': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=60',
  'Hair Care': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=60',
  'Oral Care': 'https://images.unsplash.com/photo-1559599101-f09722fb4948?w=500&auto=format&fit=crop&q=60',
  'Cleaning Products': 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=500&auto=format&fit=crop&q=60',
  'Laundry': 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=500&auto=format&fit=crop&q=60',
  'Kitchen Items': 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500&auto=format&fit=crop&q=60',
  'Stationery': 'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=500&auto=format&fit=crop&q=60',
  'Baby Care': 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=500&auto=format&fit=crop&q=60',
  'Pet Care': 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=500&auto=format&fit=crop&q=60'
};

export default function CategoryGrid({ categories = [], onSelectCategory }) {
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-slate-900">Explore Categories</h2>
          <p className="text-xs text-slate-500">Find everything from daily staples to personal care</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4">
        {categories.map((cat) => {
          const imgSrc = cat.image || categoryImages[cat.name] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60';
          
          return (
            <div
              key={cat.id || cat.name}
              onClick={() => onSelectCategory && onSelectCategory(cat.name)}
              className="bg-white rounded-3xl p-2.5 border border-slate-100 shadow-card shadow-card-hover cursor-pointer group flex flex-col items-center text-center transition-all hover:border-emerald-200"
            >
              {/* Category Image Picture Container */}
              <div className="w-full h-20 sm:h-24 rounded-2xl overflow-hidden bg-emerald-50/50 mb-2 border border-slate-100 relative shadow-inner">
                <img
                  src={imgSrc}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/20 via-transparent to-transparent group-hover:opacity-0 transition-opacity"></div>
              </div>

              {/* Category Name */}
              <span className="text-xs font-extrabold text-slate-800 group-hover:text-emerald-700 transition-colors line-clamp-1 leading-tight px-1">
                {cat.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
