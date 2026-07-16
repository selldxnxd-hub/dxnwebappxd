/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UpazilaItem {
  en: string;
  bn: string;
}

export interface DistrictItem {
  en: string;
  bn: string;
  upazilas: UpazilaItem[];
}

export const bangladeshDistrictsData: Record<string, DistrictItem> = {
  "Dhaka": {
    en: "Dhaka",
    bn: "ঢাকা",
    upazilas: [
      { en: "Dhamrai", bn: "ধামরাই" },
      { en: "Dohar", bn: "দোহার" },
      { en: "Keraniganj", bn: "কেরানীগঞ্জ" },
      { en: "Nawabganj", bn: "নবাবগঞ্জ" },
      { en: "Savar", bn: "সাভার" },
      { en: "Mirpur", bn: "মিরপুর" },
      { en: "Uttara", bn: "উত্তরা" },
      { en: "Gulshan", bn: "গুলশান" },
      { en: "Dhanmondi", bn: "ধানমন্ডি" },
      { en: "Badda", bn: "বাড্ডা" },
      { en: "Demra", bn: "ডেমরা" },
      { en: "Hazaribagh", bn: "হাজারীবাগ" },
      { en: "Kadamtali", bn: "কদমতলী" },
      { en: "Cantonment", bn: "ক্যান্টনমেন্ট" },
      { en: "Khilgaon", bn: "খিলগাঁও" },
      { en: "Motijheel", bn: "মতিঝিল" },
      { en: "Pallabi", bn: "পল্লবী" },
      { en: "Ramna", bn: "রমনা" },
      { en: "Sabujbagh", bn: "সবুজবাগ" },
      { en: "Tejgaon", bn: "তেজগাঁও" },
      { en: "Mohammadpur", bn: "মোহাম্মদপুর" },
      { en: "Jatrabari", bn: "যাত্রাবাড়ী" }
    ]
  },
  "Chittagong": {
    en: "Chittagong",
    bn: "চট্টগ্রাম",
    upazilas: [
      { en: "Chittagong Sadar", bn: "চট্টগ্রাম সদর" },
      { en: "Anwara", bn: "আনোয়ারা" },
      { en: "Banshkhali", bn: "বাশখালী" },
      { en: "Boalkhali", bn: "বোয়ালখালী" },
      { en: "Chandanaish", bn: "চন্দনাইশ" },
      { en: "Fatikchhari", bn: "ফটিকছড়ি" },
      { en: "Hathazari", bn: "হঠহাজারী" },
      { en: "Lohagara", bn: "লোহাগড়া" },
      { en: "Mirsharai", bn: "মীরসরাই" },
      { en: "Patiya", bn: "পটিয়া" },
      { en: "Rangunia", bn: "রাঙ্গুনিয়া" },
      { en: "Raozan", bn: "রাউজান" },
      { en: "Sandwip", bn: "সন্দ্বীপ" },
      { en: "Satkania", bn: "সাতকানিয়া" },
      { en: "Sitakunda", bn: "সীতাকুণ্ড" }
    ]
  },
  "Cox's Bazar": {
    en: "Cox's Bazar",
    bn: "কক্সবাজার",
    upazilas: [
      { en: "Cox's Bazar Sadar", bn: "কক্সবাজার সদর" },
      { en: "Chakaria", bn: "চকোরিয়া" },
      { en: "Maheshkhali", bn: "মহেশখালী" },
      { en: "Ramu", bn: "রামু" },
      { en: "Teknaf", bn: "টেকনাফ" },
      { en: "Ukhia", bn: "উখিয়া" },
      { en: "Pekua", bn: "পেকুয়া" },
      { en: "Kutubdia", bn: "কুতুবদিয়া" }
    ]
  },
  "Sylhet": {
    en: "Sylhet",
    bn: "সিলেট",
    upazilas: [
      { en: "Sylhet Sadar", bn: "সিলেট সদর" },
      { en: "Balaganj", bn: "বালাগঞ্জ" },
      { en: "Beanibazar", bn: "বিয়ানীবাজার" },
      { en: "Bishwanath", bn: "বিশ্বনাথ" },
      { en: "Companiganj", bn: "কোম্পানীগঞ্জ" },
      { en: "Fenchuganj", bn: "ফেঞ্চুগঞ্জ" },
      { en: "Golapganj", bn: "গোলাপগঞ্জ" },
      { en: "Gowainghat", bn: "গোয়াইনঘাট" },
      { en: "Jaintiapur", bn: "জৈন্তাপুর" },
      { en: "Kanaighat", bn: "কানাইঘাট" },
      { en: "Osmani Nagar", bn: "ওসমানী নগর" },
      { en: "Zakiganj", bn: "জকিগঞ্জ" },
      { en: "South Surma", bn: "দক্ষিণ সুরমা" }
    ]
  },
  "Rajshahi": {
    en: "Rajshahi",
    bn: "রাজশাহী",
    upazilas: [
      { en: "Rajshahi Sadar", bn: "রাজশাহী সদর" },
      { en: "Bagha", bn: "বাঘা" },
      { en: "Bagmara", bn: "বাগমারা" },
      { en: "Charghat", bn: "চারঘাট" },
      { en: "Durgapur", bn: "দুর্গাপুর" },
      { en: "Godagari", bn: "গোদাগাড়ী" },
      { en: "Mohanpur", bn: "মোহনপুর" },
      { en: "Paba", bn: "পবা" },
      { en: "Puthia", bn: "পুঠিয়া" },
      { en: "Tanore", bn: "তানোর" }
    ]
  },
  "Khulna": {
    en: "Khulna",
    bn: "খুলনা",
    upazilas: [
      { en: "Khulna Sadar", bn: "খুলনা সদর" },
      { en: "Batiaghata", bn: "বটিয়াঘাটা" },
      { en: "Dacope", bn: "দাকোপ" },
      { en: "Dumuria", bn: "ডুমুরিয়া" },
      { en: "Dighalia", bn: "দিঘলিয়া" },
      { en: "Koyra", bn: "কয়রা" },
      { en: "Paikgachha", bn: "পাইকগাছা" },
      { en: "Phultala", bn: "ফুলতলা" },
      { en: "Rupsha", bn: "রূপসা" }
    ]
  },
  "Barisal": {
    en: "Barisal",
    bn: "বরিশাল",
    upazilas: [
      { en: "Barisal Sadar", bn: "বরিশাল সদর" },
      { en: "Agailjhara", bn: "আগৈলঝাড়া" },
      { en: "Babuganj", bn: "বাবুগঞ্জ" },
      { en: "Bakerganj", bn: "বাকেরগঞ্জ" },
      { en: "Banaripara", bn: "বানারীপাড়া" },
      { en: "Gaurnadi", bn: "গৌরনদী" },
      { en: "Hizla", bn: "হিজলা" },
      { en: "Mehendiganj", bn: "মেহেন্দিগঞ্জ" },
      { en: "Muladi", bn: "মুলাদী" },
      { en: "Wazirpur", bn: "উজিরপুর" }
    ]
  },
  "Rangpur": {
    en: "Rangpur",
    bn: "রংপুর",
    upazilas: [
      { en: "Rangpur Sadar", bn: "রংপুর সদর" },
      { en: "Badarganj", bn: "বদরগঞ্জ" },
      { en: "Gangachhara", bn: "গঙ্গাচড়া" },
      { en: "Kaunia", bn: "কাউনিয়া" },
      { en: "Mithapukur", bn: "মিঠাপুকুর" },
      { en: "Pirgachha", bn: "পীরগাছা" },
      { en: "Pirganj", bn: "পীরগঞ্জ" },
      { en: "Taraganj", bn: "তারাগঞ্জ" }
    ]
  },
  "Mymensingh": {
    en: "Mymensingh",
    bn: "ময়মনসিংহ",
    upazilas: [
      { en: "Mymensingh Sadar", bn: "ময়মনসিংহ সদর" },
      { en: "Bhaluka", bn: "ভালুকা" },
      { en: "Dhobaura", bn: "ধোবাউড়া" },
      { en: "Fulbaria", bn: "ফুলবাড়ীয়া" },
      { en: "Gaffargaon", bn: "গফরগাঁও" },
      { en: "Gauripur", bn: "গৌরীপুর" },
      { en: "Haluaghat", bn: "হালুয়াঘাট" },
      { en: "Ishwarganj", bn: "ঈশ্বরগঞ্জ" },
      { en: "Muktagachha", bn: "মুক্তাগাছা" },
      { en: "Nandail", bn: "নান্দাইল" },
      { en: "Phulpur", bn: "ফুলপুর" },
      { en: "Trishal", bn: "ত্রিশাল" },
      { en: "Tara Khanda", bn: "তারাকান্দা" }
    ]
  },
  "Bogra": {
    en: "Bogra",
    bn: "বগুড়া",
    upazilas: [
      { en: "Bogra Sadar", bn: "বগুড়া সদর" },
      { en: "Adamdighi", bn: "আদমদীঘি" },
      { en: "Dhunat", bn: "ধুনট" },
      { en: "Dhupchanchia", bn: "দুপচাঁচিয়া" },
      { en: "Gabtali", bn: "গাবতলী" },
      { en: "Kahaloo", bn: "কাহালু" },
      { en: "Nandigram", bn: "নন্দীগ্রাম" },
      { en: "Sariakandi", bn: "সারিয়াকান্দি" },
      { en: "Sherpur", bn: "শেরপুর" },
      { en: "Shajahanpur", bn: "শাহজাহানপুর" },
      { en: "Shibganj", bn: "শিবগঞ্জ" },
      { en: "Sonatola", bn: "সোনাতলা" }
    ]
  },
  "Gazipur": {
    en: "Gazipur",
    bn: "গাজীপুর",
    upazilas: [
      { en: "Gazipur Sadar", bn: "গাজীপুর সদর" },
      { en: "Kaliakair", bn: "কালিয়াকৈর" },
      { en: "Kaliganj", bn: "কালীগঞ্জ" },
      { en: "Kapasia", bn: "কাপাসিয়া" },
      { en: "Sreepur", bn: "শ্রীপুর" }
    ]
  },
  "Narayanganj": {
    en: "Narayanganj",
    bn: "নারায়ণগঞ্জ",
    upazilas: [
      { en: "Narayanganj Sadar", bn: "নারায়ণগঞ্জ সদর" },
      { en: "Araihazar", bn: "আড়াইহাজার" },
      { en: "Bandar", bn: "বন্দর" },
      { en: "Rupganj", bn: "রূপগঞ্জ" },
      { en: "Sonargaon", bn: "সোনারগাঁও" }
    ]
  },
  "Comilla": {
    en: "Comilla",
    bn: "কুমিল্লা",
    upazilas: [
      { en: "Comilla Sadar", bn: "কুমিল্লা সদর" },
      { en: "Barura", bn: "বরুড়া" },
      { en: "Brahmanpara", bn: "ব্রাহ্মণপাড়া" },
      { en: "Burichang", bn: "বুড়িচং" },
      { en: "Chandina", bn: "চান্দিনা" },
      { en: "Chauddagram", bn: "চৌদ্দগ্রাম" },
      { en: "Daudkandi", bn: "দাউদকান্দি" },
      { en: "Debidwar", bn: "দেবিদ্বার" },
      { en: "Homna", bn: "হোমনা" },
      { en: "Laksam", bn: "লাকসাম" },
      { en: "Monohorganj", bn: "মনোহরগঞ্জ" },
      { en: "Meghna", bn: "মেঘনা" },
      { en: "Muradnagar", bn: "মুরাদনগর" },
      { en: "Nangalkot", bn: "নাঙ্গলকোট" },
      { en: "Sadar South", bn: "সদর দক্ষিণ" },
      { en: "Titas", bn: "তিতাস" }
    ]
  },
  "Feni": {
    en: "Feni",
    bn: "ফেনী",
    upazilas: [
      { en: "Feni Sadar", bn: "ফেনী সদর" },
      { en: "Chhagalnaiya", bn: "ছাগলনাইয়া" },
      { en: "Daganbhuiyan", bn: "দাগনভূঞা" },
      { en: "Parshuram", bn: "পরশুরাম" },
      { en: "Sonagazi", bn: "সোনাগাজী" },
      { en: "Fulgazi", bn: "ফুলগাজী" }
    ]
  },
  "Noakhali": {
    en: "Noakhali",
    bn: "নোয়াখালী",
    upazilas: [
      { en: "Noakhali Sadar", bn: "নোয়াখালী সদর" },
      { en: "Begumganj", bn: "বেগমগঞ্জ" },
      { en: "Chatkhil", bn: "চাটখিল" },
      { en: "Companiganj", bn: "কোম্পানীগঞ্জ" },
      { en: "Hatiya", bn: "হাতিয়া" },
      { en: "Senbagh", bn: "সেনবাগ" },
      { en: "Sonaimuri", bn: "সোনাইমুড়ী" },
      { en: "Subarnachar", bn: "সুবর্ণচর" },
      { en: "Kabirhat", bn: "কবিরহাট" }
    ]
  },
  "Bagerhat": {
    en: "Bagerhat",
    bn: "বাগেরহাট",
    upazilas: [
      { en: "Bagerhat Sadar", bn: "বাগেরহাট সদর" },
      { en: "Chitalmari", bn: "চিতলমারী" },
      { en: "Fakirhat", bn: "ফকিরহাট" },
      { en: "Kachua", bn: "কচুয়া" },
      { en: "Mollahat", bn: "মোল্লাহাট" },
      { en: "Mongla", bn: "মংলা" },
      { en: "Morrelganj", bn: "মোড়েলগঞ্জ" },
      { en: "Rampal", bn: "রামপাল" },
      { en: "Sarankhola", bn: "শরণখোলা" }
    ]
  },
  "Bandarban": {
    en: "Bandarban",
    bn: "বান্দরবান",
    upazilas: [
      { en: "Bandarban Sadar", bn: "বান্দরবান সদর" },
      { en: "Alikadam", bn: "আলিকদম" },
      { en: "Lama", bn: "লামা" },
      { en: "Naikhongchhari", bn: "নাইক্ষ্যংছড়ি" },
      { en: "Rowangchhari", bn: "রোয়াংছড়ি" },
      { en: "Ruma", bn: "রুমা" },
      { en: "Thanchi", bn: "থানচি" }
    ]
  },
  "Barguna": {
    en: "Barguna",
    bn: "বরগুনা",
    upazilas: [
      { en: "Barguna Sadar", bn: "বরগুনা সদর" },
      { en: "Amtali", bn: "আমতলী" },
      { en: "Bamna", bn: "বামনা" },
      { en: "Betagi", bn: "বেতাগী" },
      { en: "Patharghata", bn: "পাথরঘাটা" },
      { en: "Taltali", bn: "তালতলী" }
    ]
  },
  "Bhola": {
    en: "Bhola",
    bn: "ভোলা",
    upazilas: [
      { en: "Bhola Sadar", bn: "ভোলা সদর" },
      { en: "Burhanuddin", bn: "বোরহানউদ্দিন" },
      { en: "Char Fasson", bn: "চরফ্যাশন" },
      { en: "Daulatkhan", bn: "দৌলতখান" },
      { en: "Lalmohan", bn: "লালমোহন" },
      { en: "Manpura", bn: "মনপুরা" },
      { en: "Tazumuddin", bn: "তজুমদ্দিন" }
    ]
  },
  "Brahmanbaria": {
    en: "Brahmanbaria",
    bn: "ব্রাহ্মণবাড়িয়া",
    upazilas: [
      { en: "Brahmanbaria Sadar", bn: "ব্রাহ্মণবাড়িয়া সদর" },
      { en: "Ashuganj", bn: "আশুগঞ্জ" },
      { en: "Bancharampur", bn: "বাঞ্ছারামপুর" },
      { en: "Bijoynagar", bn: "বিজয়নগর" },
      { en: "Kasba", bn: "কসবা" },
      { en: "Nabinagar", bn: "নবীনগর" },
      { en: "Nasirnagar", bn: "নাসিরনগর" },
      { en: "Sarail", bn: "সরাইল" },
      { en: "Akhaura", bn: "আখাউড়া" }
    ]
  },
  "Chandpur": {
    en: "Chandpur",
    bn: "চাঁদপুর",
    upazilas: [
      { en: "Chandpur Sadar", bn: "চাঁদপুর সদর" },
      { en: "Faridganj", bn: "ফরিদগঞ্জ" },
      { en: "Haimchar", bn: "হাইমচর" },
      { en: "Hajiganj", bn: "হাজীগঞ্জ" },
      { en: "Kachua", bn: "কচুয়া" },
      { en: "Matlab North", bn: "মতলব উত্তর" },
      { en: "Matlab South", bn: "মতলব দক্ষিণ" },
      { en: "Shahrasti", bn: "শাহরাস্তি" }
    ]
  },
  "Chuadanga": {
    en: "Chuadanga",
    bn: "চুয়াডাঙ্গা",
    upazilas: [
      { en: "Chuadanga Sadar", bn: "চুয়াডাঙ্গা সদর" },
      { en: "Alamdanga", bn: "আলমডাঙ্গা" },
      { en: "Damurhuda", bn: "দামুড়হুদা" },
      { en: "Jibannagar", bn: "জীবননগর" }
    ]
  },
  "Dinajpur": {
    en: "Dinajpur",
    bn: "দিনাজপুর",
    upazilas: [
      { en: "Dinajpur Sadar", bn: "দিনাজপুর সদর" },
      { en: "Birampur", bn: "বিরামপুর" },
      { en: "Birganj", bn: "বীরগঞ্জ" },
      { en: "Birol", bn: "বিরল" },
      { en: "Bochaganj", bn: "বোচাগঞ্জ" },
      { en: "Chirirbandar", bn: "চিরিরবন্দর" },
      { en: "Phulbari", bn: "ফুলবাড়ী" },
      { en: "Ghoraghat", bn: "ঘোড়াঘাট" },
      { en: "Hakimpur", bn: "হাকিমপুর" },
      { en: "Kaharole", bn: "কাহারোল" },
      { en: "Khansama", bn: "খানসামা" },
      { en: "Nawabganj", bn: "নবাবগঞ্জ" },
      { en: "Parbatipur", bn: "পার্বতীপুর" }
    ]
  },
  "Faridpur": {
    en: "Faridpur",
    bn: "ফরিদপুর",
    upazilas: [
      { en: "Faridpur Sadar", bn: "ফরিদপুর সদর" },
      { en: "Alfadanga", bn: "আলফাডাঙ্গা" },
      { en: "Banga", bn: "ভাঙ্গা" },
      { en: "Boalmari", bn: "বোয়ালমারী" },
      { en: "Charbhadrasan", bn: "চরভদ্রাসন" },
      { en: "Madhukhali", bn: "মধুখালী" },
      { en: "Nagarkanda", bn: "নগরকান্দা" },
      { en: "Sadarpur", bn: "সদরপুর" },
      { en: "Saltha", bn: "সালথা" }
    ]
  },
  "Gaibandha": {
    en: "Gaibandha",
    bn: "গাইবান্ধা",
    upazilas: [
      { en: "Gaibandha Sadar", bn: "গাইবান্ধা সদর" },
      { en: "Phulchhari", bn: "ফুলছড়ি" },
      { en: "Gobindaganj", bn: "গোবিন্দগঞ্জ" },
      { en: "Palashbari", bn: "পলাশবাড়ী" },
      { en: "Sadullapur", bn: "সাদুল্লাপুর" },
      { en: "Sughatta", bn: "সাঘাটা" },
      { en: "Sundarganj", bn: "সুন্দরগঞ্জ" }
    ]
  },
  "Gopalganj": {
    en: "Gopalganj",
    bn: "গোপালগঞ্জ",
    upazilas: [
      { en: "Gopalganj Sadar", bn: "গোপালগঞ্জ সদর" },
      { en: "Kotalipara", bn: "কোটালীপাড়া" },
      { en: "Kashiani", bn: "কাশিয়ানী" },
      { en: "Muksudpur", bn: "মুকসুদপুর" },
      { en: "Tungipara", bn: "টুঙ্গিপাড়া" }
    ]
  },
  "Habiganj": {
    en: "Habiganj",
    bn: "হবিগঞ্জ",
    upazilas: [
      { en: "Habiganj Sadar", bn: "হবিগঞ্জ সদর" },
      { en: "Ajmiriganj", bn: "আজমিরীগঞ্জ" },
      { en: "Bahubal", bn: "বাহুবল" },
      { en: "Baniyachong", bn: "বানিয়াচং" },
      { en: "Chunarughat", bn: "চুনারুঘাট" },
      { en: "Lakhai", bn: "লাখাই" },
      { en: "Madhabpur", bn: "মাধবপুর" },
      { en: "Nabiganj", bn: "নবীগঞ্জ" },
      { en: "Sayestaganj", bn: "শায়েস্তাগঞ্জ" }
    ]
  },
  "Jamalpur": {
    en: "Jamalpur",
    bn: "জামালপুর",
    upazilas: [
      { en: "Jamalpur Sadar", bn: "জামালপুর সদর" },
      { en: "Bakshiganj", bn: "বকশীগঞ্জ" },
      { en: "Dewanganj", bn: "দেওয়ানগঞ্জ" },
      { en: "Isampur", bn: "ইসলামপুর" },
      { en: "Madarganj", bn: "মাদারগঞ্জ" },
      { en: "Melandaha", bn: "মেলান্দহ" },
      { en: "Sarishabari", bn: "সরিষাবাড়ী" }
    ]
  },
  "Jessore": {
    en: "Jessore",
    bn: "যশোর",
    upazilas: [
      { en: "Jessore Sadar", bn: "যশোর সদর" },
      { en: "Abhaynagar", bn: "অভয়নগর" },
      { en: "Bagherpara", bn: "বাঘারপাড়া" },
      { en: "Chougachha", bn: "চৌগাছা" },
      { en: "Jhikargachha", bn: "ঝিকরগাছা" },
      { en: "Keshabpur", bn: "কেশবপুর" },
      { en: "Manirampur", bn: "মণিরামপুর" },
      { en: "Sharsha", bn: "শার্শা" }
    ]
  },
  "Jhalokati": {
    en: "Jhalokati",
    bn: "ঝালকাঠি",
    upazilas: [
      { en: "Jhalokati Sadar", bn: "ঝালকাঠি সদর" },
      { en: "Kathalia", bn: "কাঠালিয়া" },
      { en: "Nalchity", bn: "নলছিটি" },
      { en: "Rajapur", bn: "রাজাপুর" }
    ]
  },
  "Jhenaidah": {
    en: "Jhenaidah",
    bn: "ঝিনাইদহ",
    upazilas: [
      { en: "Jhenaidah Sadar", bn: "ঝিনাইদহ সদর" },
      { en: "Harinakunda", bn: "হরিণাকুণ্ড" },
      { en: "Kaliganj", bn: "কালীগঞ্জ" },
      { en: "Kotchandpur", bn: "কোটচাঁদপুর" },
      { en: "Maheshpur", bn: "মহেশপুর" },
      { en: "Shailkupa", bn: "শৈলকুপা" }
    ]
  },
  "Joypurhat": {
    en: "Joypurhat",
    bn: "জয়পুরহাট",
    upazilas: [
      { en: "Joypurhat Sadar", bn: "জয়পুরহাট সদর" },
      { en: "Akkelpur", bn: "আক্কেলপুর" },
      { en: "Kalai", bn: "কালাই" },
      { en: "Khetlal", bn: "খেতলাল" },
      { en: "Panchbibi", bn: "পাঁচবিবি" }
    ]
  },
  "Khagrachhari": {
    en: "Khagrachhari",
    bn: "খাগড়াছড়ি",
    upazilas: [
      { en: "Khagrachhari Sadar", bn: "খাগড়াছড়ি সদর" },
      { en: "Dighinala", bn: "দিঘীনালা" },
      { en: "Lakshmichhari", bn: "লক্ষ্মীছড়ি" },
      { en: "Mahalchhari", bn: "মহালছড়ি" },
      { en: "Manikchhari", bn: "মানিকছড়ি" },
      { en: "Matiranga", bn: "মাটিরাঙ্গা" },
      { en: "Panchhari", bn: "পানছড়ি" },
      { en: "Ramgarh", bn: "রামগড়" }
    ]
  },
  "Kishoreganj": {
    en: "Kishoreganj",
    bn: "কিশোরগঞ্জ",
    upazilas: [
      { en: "Kishoreganj Sadar", bn: "কিশোরগঞ্জ সদর" },
      { en: "Astagram", bn: "অষ্টগ্রাম" },
      { en: "Bajitpur", bn: "বাজিতপুর" },
      { en: "Bhairab", bn: "ভৈরব" },
      { en: "Hossainpur", bn: "হোসেনপুর" },
      { en: "Itna", bn: "ইটনা" },
      { en: "Karimganj", bn: "করিমগঞ্জ" },
      { en: "Katiadi", bn: "কটিয়াদী" },
      { en: "Kuliarchar", bn: "কুলিয়ারচর" },
      { en: "Mithamain", bn: "মিঠামইন" },
      { en: "Nikli", bn: "নিকলী" },
      { en: "Pakundia", bn: "পাকুন্দিয়া" },
      { en: "Tarail", bn: "তাড়াইল" }
    ]
  },
  "Kurigram": {
    en: "Kurigram",
    bn: "কুড়িগ্রাম",
    upazilas: [
      { en: "Kurigram Sadar", bn: "কুড়িগ্রাম সদর" },
      { en: "Bhurungamari", bn: "ভুরুঙ্গামারী" },
      { en: "Char Rajibpur", bn: "রাজিবপুর" },
      { en: "Chilmari", bn: "চিলমারী" },
      { en: "Phulbari", bn: "ফুলবাড়ী" },
      { en: "Nageshwari", bn: "নাগেশ্বরী" },
      { en: "Rajarhat", bn: "রাজারহাট" },
      { en: "Raumari", bn: "রৌমারী" },
      { en: "Ulipur", bn: "উলিপুর" }
    ]
  },
  "Kushtia": {
    en: "Kushtia",
    bn: "কুষ্টিয়া",
    upazilas: [
      { en: "Kushtia Sadar", bn: "কুষ্টিয়া সদর" },
      { en: "Bheramara", bn: "ভেড়ামারা" },
      { en: "Daulatpur", bn: "দৌলতপুর" },
      { en: "Khoksa", bn: "খোকসা" },
      { en: "Kumarkhali", bn: "কুমারখালী" },
      { en: "Mirpur", bn: "মিরপুর" }
    ]
  },
  "Lakshmipur": {
    en: "Lakshmipur",
    bn: "লক্ষ্মীপুর",
    upazilas: [
      { en: "Lakshmipur Sadar", bn: "লক্ষ্মীপুর সদর" },
      { en: "Raipur", bn: "রায়পুর" },
      { en: "Ramganj", bn: "রামগঞ্জ" },
      { en: "Ramgati", bn: "রামগতি" },
      { en: "Kamalnagar", bn: "কমলনগর" }
    ]
  },
  "Lalmonirhat": {
    en: "Lalmonirhat",
    bn: "লালমনিরহাট",
    upazilas: [
      { en: "Lalmonirhat Sadar", bn: "লালমনিরহাট সদর" },
      { en: "Aditmari", bn: "আদিতমারী" },
      { en: "Hatibandha", bn: "হাতিবান্ধা" },
      { en: "Kaliganj", bn: "কালীগঞ্জ" },
      { en: "Patgram", bn: "পাটগ্রাম" }
    ]
  },
  "Madaripur": {
    en: "Madaripur",
    bn: "মাদারীপুর",
    upazilas: [
      { en: "Madaripur Sadar", bn: "মাদারীপুর সদর" },
      { en: "Kalkini", bn: "কালকিনি" },
      { en: "Rajoir", bn: "রাজৈর" },
      { en: "Shibchar", bn: "শিবচর" }
    ]
  },
  "Magura": {
    en: "Magura",
    bn: "মাগুরা",
    upazilas: [
      { en: "Magura Sadar", bn: "মাগুরা সদর" },
      { en: "Mohammadpur", bn: "মোহাম্মদপুর" },
      { en: "Shalikha", bn: "শালিখা" },
      { en: "Sreepur", bn: "শ্রীপুর" }
    ]
  },
  "Manikganj": {
    en: "Manikganj",
    bn: "মানিকগঞ্জ",
    upazilas: [
      { en: "Manikganj Sadar", bn: "মানিকগঞ্জ সদর" },
      { en: "Daulatpur", bn: "দৌলতপুর" },
      { en: "Ghior", bn: "ঘিওর" },
      { en: "Harirampur", bn: "হরিরামপুর" },
      { en: "Singair", bn: "সিংগাইর" },
      { en: "Shibalaya", bn: "শিবালয়" },
      { en: "Saturia", bn: "সাটুরিয়া" }
    ]
  },
  "Maulvibazar": {
    en: "Maulvibazar",
    bn: "মৌলভীবাজার",
    upazilas: [
      { en: "Maulvibazar Sadar", bn: "মৌলভীবাজার সদর" },
      { en: "Barlekha", bn: "বড়লেখা" },
      { en: "Kamalganj", bn: "কমলগঞ্জ" },
      { en: "Kulaura", bn: "কুলাউড়া" },
      { en: "Rajnagar", bn: "রাজনগর" },
      { en: "Sreemangal", bn: "শ্রীমঙ্গল" },
      { en: "Juri", bn: "জুড়ী" }
    ]
  },
  "Meherpur": {
    en: "Meherpur",
    bn: "মেহেরপুর",
    upazilas: [
      { en: "Meherpur Sadar", bn: "মেহেরপুর সদর" },
      { en: "Gangni", bn: "গাংনী" },
      { en: "Mujibnagar", bn: "মুজিবনগর" }
    ]
  },
  "Munshiganj": {
    en: "Munshiganj",
    bn: "মুন্সীগঞ্জ",
    upazilas: [
      { en: "Munshiganj Sadar", bn: "মুন্সীগঞ্জ সদর" },
      { en: "Gazaria", bn: "গজারিয়া" },
      { en: "Lohajang", bn: "লৌহজং" },
      { en: "Sirajdikhan", bn: "সিরাজদিখান" },
      { en: "Sreenagar", bn: "শ্রীনগর" },
      { en: "Tongibari", bn: "টংগিবাড়ী" }
    ]
  },
  "Naogaon": {
    en: "Naogaon",
    bn: "নওগাঁ",
    upazilas: [
      { en: "Naogaon Sadar", bn: "নওগাঁ সদর" },
      { en: "Atrai", bn: "আত্রাই" },
      { en: "Badalgachhi", bn: "বদলগাছী" },
      { en: "Dhamoirhat", bn: "ধামইরহাট" },
      { en: "Manda", bn: "মান্দা" },
      { en: "Mahadebpur", bn: "মহাদেবপুর" },
      { en: "Niamatpur", bn: "নিয়ামতপুর" },
      { en: "Patnitala", bn: "পত্নীতলা" },
      { en: "Porsha", bn: "পোরশা" },
      { en: "Raninagar", bn: "রাণীনগর" },
      { en: "Sapahar", bn: "সাপাহার" }
    ]
  },
  "Natore": {
    en: "Natore",
    bn: "নাটোর",
    upazilas: [
      { en: "Natore Sadar", bn: "নাটোর সদর" },
      { en: "Bagatipara", bn: "বাগাতিপাড়া" },
      { en: "Baraigram", bn: "বড়াইগ্রাম" },
      { en: "Gurudaspur", bn: "গুরুদাসপুর" },
      { en: "Lalpur", bn: "লালপুর" },
      { en: "Singra", bn: "সিংড়া" },
      { en: "Naldanga", bn: "নলডাঙ্গা" }
    ]
  },
  "Chapai Nawabganj": {
    en: "Chapai Nawabganj",
    bn: "চাঁপাইনবাবগঞ্জ",
    upazilas: [
      { en: "Chapai Nawabganj Sadar", bn: "চাঁপাইনবাবগঞ্জ সদর" },
      { en: "Bholahat", bn: "ভোলাহাট" },
      { en: "Gomastapur", bn: "গোমস্তাপুর" },
      { en: "Nachole", bn: "নাচোল" },
      { en: "Shibganj", bn: "শিবগঞ্জ" }
    ]
  },
  "Narail": {
    en: "Narail",
    bn: "নড়াইল",
    upazilas: [
      { en: "Narail Sadar", bn: "নড়াইল সদর" },
      { en: "Kalia", bn: "কালিয়া" },
      { en: "Lohagara", bn: "লোহাগড়া" }
    ]
  },
  "Narsingdi": {
    en: "Narsingdi",
    bn: "নরসিংদী",
    upazilas: [
      { en: "Narsingdi Sadar", bn: "নরসিংদী সদর" },
      { en: "Belabo", bn: "বেলাবো" },
      { en: "Monohardi", bn: "মনোহরদী" },
      { en: "Palash", bn: "পলাশ" },
      { en: "Raipura", bn: "রায়পুরা" },
      { en: "Shibpur", bn: "শিবপুর" }
    ]
  },
  "Netrokona": {
    en: "Netrokona",
    bn: "নেত্রকোণা",
    upazilas: [
      { en: "Netrokona Sadar", bn: "নেত্রকোণা সদর" },
      { en: "Atpara", bn: "আটপাড়া" },
      { en: "Barhatta", bn: "বারহাট্টা" },
      { en: "Durgapur", bn: "দুর্গাপুর" },
      { en: "Khaliajuri", bn: "খালিয়াজুরী" },
      { en: "Kalmakanda", bn: "কলমাকান্দা" },
      { en: "Kendua", bn: "কেন্দুয়া" },
      { en: "Madan", bn: "মদন" },
      { en: "Mohanganj", bn: "মোহনগঞ্জ" },
      { en: "Purbadhala", bn: "পূর্বধলা" }
    ]
  },
  "Nilphamari": {
    en: "Nilphamari",
    bn: "নীলফামারী",
    upazilas: [
      { en: "Nilphamari Sadar", bn: "নীলফামারী সদর" },
      { en: "Dimla", bn: "ডিমলা" },
      { en: "Domar", bn: "ডোমার" },
      { en: "Jaldhaka", bn: "জলঢাকা" },
      { en: "Kishoreganj", bn: "কিশোরগঞ্জ" },
      { en: "Syedpur", bn: "সৈয়দপুর" }
    ]
  },
  "Pabna": {
    en: "Pabna",
    bn: "পাবনা",
    upazilas: [
      { en: "Pabna Sadar", bn: "পাবনা সদর" },
      { en: "Atgharia", bn: "আটঘরিয়া" },
      { en: "Bera", bn: "বেড়া" },
      { en: "Bhangura", bn: "ভাঙ্গুড়া" },
      { en: "Chatmohar", bn: "চাটমোহর" },
      { en: "Faridpur", bn: "ফরিদপুর" },
      { en: "Ishwardi", bn: "ঈশ্বরদী" },
      { en: "Santhia", bn: "সাঁথিয়া" },
      { en: "Sujanagar", bn: "সুজানগর" }
    ]
  },
  "Panchagarh": {
    en: "Panchagarh",
    bn: "পঞ্চগড়",
    upazilas: [
      { en: "Panchagarh Sadar", bn: "পঞ্চগড় সদর" },
      { en: "Atwari", bn: "আটোয়ারী" },
      { en: "Boda", bn: "বোদা" },
      { en: "Debiganj", bn: "দেবীগঞ্জ" },
      { en: "Tetulia", bn: "তেঁতুলিয়া" }
    ]
  },
  "Patuakhali": {
    en: "Patuakhali",
    bn: "পটুয়াখালী",
    upazilas: [
      { en: "Patuakhali Sadar", bn: "পটুয়াখালী সদর" },
      { en: "Bauphal", bn: "বাউফল" },
      { en: "Dashmina", bn: "দশমিনা" },
      { en: "Galachipa", bn: "গলাচিপা" },
      { en: "Kalapara", bn: "কলাপাড়া" },
      { en: "Mirzaganj", bn: "মির্জাগঞ্জ" },
      { en: "Rangabali", bn: "রাঙ্গাবালী" },
      { en: "Dumki", bn: "দুমকী" }
    ]
  },
  "Pirojpur": {
    en: "Pirojpur",
    bn: "পিরোজপুর",
    upazilas: [
      { en: "Pirojpur Sadar", bn: "পিরোজপুর সদর" },
      { en: "Bhandaria", bn: "ভান্ডারিয়া" },
      { en: "Kawkhali", bn: "কাউখালী" },
      { en: "Mathbaria", bn: "মঠবাড়িয়া" },
      { en: "Nazirpur", bn: "নাজিরপুর" },
      { en: "Nesarabad (Swarupkati)", bn: "নেছারাবাদ" },
      { en: "Indurkani", bn: "ইন্দুরকানী" }
    ]
  },
  "Rajbari": {
    en: "Rajbari",
    bn: "রাজবাড়ী",
    upazilas: [
      { en: "Rajbari Sadar", bn: "রাজবাড়ী সদর" },
      { en: "Baliakandi", bn: "বালিয়াকান্দি" },
      { en: "Goalanda", bn: "গোয়ালন্দ" },
      { en: "Pangsha", bn: "পাংশা" },
      { en: "Kalukhali", bn: "কালুখালী" }
    ]
  },
  "Rangamati": {
    en: "Rangamati",
    bn: "রাঙ্গামাটি",
    upazilas: [
      { en: "Rangamati Sadar", bn: "রাঙ্গামাটি সদর" },
      { en: "Baghaichhari", bn: "বাঘাইছড়ি" },
      { en: "Barkal", bn: "বরকল" },
      { en: "Kawkhali", bn: "কাউখালী" },
      { en: "Belaichhari", bn: "বিলাইছড়ি" },
      { en: "Kaptai", bn: "কাপ্তাই" },
      { en: "Juraichhari", bn: "জুরাইছড়ি" },
      { en: "Langadu", bn: "লংগদু" },
      { en: "Naniarchar", bn: "নানিয়ারচর" },
      { en: "Rajasthali", bn: "রাজস্থলী" }
    ]
  },
  "Satkhira": {
    en: "Satkhira",
    bn: "সাতক্ষীরা",
    upazilas: [
      { en: "Satkhira Sadar", bn: "সাতক্ষীরা সদর" },
      { en: "Assasuni", bn: "আশাশুনি" },
      { en: "Debhata", bn: "দেবহাটা" },
      { en: "Kalaroa", bn: "কলারোয়া" },
      { en: "Kaliganj", bn: "কালীগঞ্জ" },
      { en: "Shyamnagar", bn: "শ্যামনগর" },
      { en: "Tala", bn: "তালা" }
    ]
  },
  "Shariatpur": {
    en: "Shariatpur",
    bn: "শরীয়তপুর",
    upazilas: [
      { en: "Shariatpur Sadar", bn: "শরীয়তপুর সদর" },
      { en: "Damudya", bn: "ডামুড্যা" },
      { en: "Gosairhat", bn: "গোসাইরহাট" },
      { en: "Naria", bn: "নড়িয়া" },
      { en: "Jajira", bn: "জাজিরা" },
      { en: "Bhedarganj", bn: "ভেদরগঞ্জ" }
    ]
  },
  "Sherpur": {
    en: "Sherpur",
    bn: "শেরপুর",
    upazilas: [
      { en: "Sherpur Sadar", bn: "শেরপুর সদর" },
      { en: "Jhenaigati", bn: "ঝিনাইগাতী" },
      { en: "Nakla", bn: "নকলা" },
      { en: "Nalitabari", bn: "নালিতাবাড়ী" },
      { en: "Sreebardi", bn: "শ্রীবরদী" }
    ]
  },
  "Sirajganj": {
    en: "Sirajganj",
    bn: "সিরাজগঞ্জ",
    upazilas: [
      { en: "Sirajganj Sadar", bn: "সিরাজগঞ্জ সদর" },
      { en: "Belkuchi", bn: "বেলকুচি" },
      { en: "Chouhali", bn: "চৌহালী" },
      { en: "Kamarkhanda", bn: "কামারখন্দ" },
      { en: "Kazipur", bn: "কাজীপুর" },
      { en: "Raiganj", bn: "রায়গঞ্জ" },
      { en: "Shahjadpur", bn: "শাহজাদপুর" },
      { en: "Tarash", bn: "তাড়াশ" },
      { en: "Ullahpara", bn: "উল্লাপাড়া" }
    ]
  },
  "Sunamganj": {
    en: "Sunamganj",
    bn: "সুনামগঞ্জ",
    upazilas: [
      { en: "Sunamganj Sadar", bn: "সুনামগঞ্জ সদর" },
      { en: "Bishwamandarpur", bn: "বিশ্বম্ভরপুর" },
      { en: "Chhatak", bn: "ছাতক" },
      { en: "Derai", bn: "দিরাই" },
      { en: "Dharamapasha", bn: "ধর্মপাশা" },
      { en: "Dowarabazar", bn: "দোয়ারাবাজার" },
      { en: "Jagannathpur", bn: "জগন্নাথপুর" },
      { en: "Jamalganj", bn: "জামালগঞ্জ" },
      { en: "Sullah", bn: "শাল্লা" },
      { en: "Tahirpur", bn: "তাহিরপুর" },
      { en: "Shantiganj", bn: "শান্তিগঞ্জ" }
    ]
  },
  "Tangail": {
    en: "Tangail",
    bn: "টাঙ্গাইল",
    upazilas: [
      { en: "Tangail Sadar", bn: "টাঙ্গাইল সদর" },
      { en: "Basail", bn: "বাসাইল" },
      { en: "Bhuapur", bn: "ভূঞাপুর" },
      { en: "Delduar", bn: "দেলদুয়ার" },
      { en: "Ghatail", bn: "ঘাটাইল" },
      { en: "Gopalpur", bn: "গোপালপুর" },
      { en: "Kalihati", bn: "কালিহাতী" },
      { en: "Madhupur", bn: "মধুপুর" },
      { en: "Mirzapur", bn: "মির্জাপুর" },
      { en: "Nagarpur", bn: "নাগরপুর" },
      { en: "Sakhipur", bn: "সখিপুর" },
      { en: "Dhanbari", bn: "ধনবাড়ী" }
    ]
  },
  "Thakurgaon": {
    en: "Thakurgaon",
    bn: "ঠাকুরগাঁও",
    upazilas: [
      { en: "Thakurgaon Sadar", bn: "ঠাকুরগাঁও সদর" },
      { en: "Baliadangi", bn: "বালিয়াডাঙ্গী" },
      { en: "Haripur", bn: "হরিপুর" },
      { en: "Ranisankail", bn: "রাণীশংকৈল" },
      { en: "Pirganj", bn: "পীরগঞ্জ" }
    ]
  }
};
