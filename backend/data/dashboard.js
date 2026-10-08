// Generic placeholder data until the MySQL tables are available.
const dashboard = {
  weather: { tempC: 27, condition: 'Humid, chance of showers' },
  courseMapping: [
    { id: 1, hkuCode: 'COMP3322', hkuTitle: 'Modern Technologies on World Wide Web', homeCode: 'CS350', status: 'approved' },
    { id: 2, hkuCode: 'ECON2210', hkuTitle: 'Intermediate Microeconomics', homeCode: 'ECON201', status: 'approved' },
    { id: 3, hkuCode: 'STAT2601', hkuTitle: 'Probability and Statistics I', homeCode: 'MATH230', status: 'approved' },
    { id: 4, hkuCode: 'CAES1000', hkuTitle: 'Core University English', homeCode: 'ENG101', status: 'pending' },
    { id: 5, hkuCode: 'HIST2088', hkuTitle: 'History of Hong Kong', homeCode: 'HIST210', status: 'pending' },
    { id: 6, hkuCode: 'PHYS1250', hkuTitle: 'Physics for Life Sciences', homeCode: 'PHY110', status: 'rejected' },
  ],
  latestPosts: [
    { id: 1, title: 'My first week at HKU: what I wish I knew', author: 'Mia', publishedAt: '2026-10-06' },
    { id: 2, title: 'How to get an Octopus card and top it up', author: 'Lucas', publishedAt: '2026-10-04' },
    { id: 3, title: 'Cheap eats in Kennedy Town', author: 'Aiko', publishedAt: '2026-10-01' },
  ],
  foodSpots: [
    { id: 1, name: 'Main Building Canteen', cuisine: 'Local set meals', walkMinutes: 3 },
    { id: 2, name: 'Sai Ying Pun Dim Sum House', cuisine: 'Cantonese', walkMinutes: 8 },
    { id: 3, name: 'Centennial Campus Cafe', cuisine: 'Cafe and sandwiches', walkMinutes: 5 },
  ],
}

module.exports = dashboard
