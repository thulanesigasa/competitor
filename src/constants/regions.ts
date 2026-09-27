export interface SouthernAfricanCountry {
  name: string;
  code: string;
  dialCode: string;
  provinces: {
    name: string;
    towns: string[];
  }[];
}

export const SOUTHERN_AFRICAN_COUNTRIES: SouthernAfricanCountry[] = [
  {
    name: 'South Africa',
    code: 'ZA',
    dialCode: '+27',
    provinces: [
      {
        name: 'Gauteng',
        towns: ['Johannesburg', 'Pretoria', 'Soweto', 'Sandton', 'Centurion', 'Midrand'],
      },
      {
        name: 'Western Cape',
        towns: ['Cape Town', 'Stellenbosch', 'George', 'Paarl', 'Worcester', 'Mossel Bay'],
      },
      {
        name: 'KwaZulu-Natal',
        towns: ['Durban', 'Pietermaritzburg', 'Newcastle', 'Richards Bay', 'Ballito'],
      },
      {
        name: 'Eastern Cape',
        towns: ['Gqeberha', 'East London', 'Mthatha', 'Makhanda', 'Kariega'],
      },
      {
        name: 'Free State',
        towns: ['Bloemfontein', 'Welkom', 'Sasolburg', 'Bethlehem', 'Kroonstad'],
      },
      {
        name: 'Limpopo',
        towns: ['Polokwane', 'Thohoyandou', 'Tzaneen', 'Mokopane', 'Bela-Bela'],
      },
      {
        name: 'Mpumalanga',
        towns: ['Mbombela', 'eMalahleni', 'Secunda', 'Middelburg', 'Standerton'],
      },
      {
        name: 'North West',
        towns: ['Rustenburg', 'Mahikeng', 'Potchefstroom', 'Klerksdorp', 'Brits'],
      },
      {
        name: 'Northern Cape',
        towns: ['Kimberley', 'Upington', 'Springbok', 'De Aar', 'Kuruman'],
      },
    ],
  },
  {
    name: 'Zimbabwe',
    code: 'ZW',
    dialCode: '+263',
    provinces: [
      { name: 'Harare', towns: ['Harare Central', 'Chitungwiza', 'Epworth', 'Ruwa'] },
      { name: 'Bulawayo', towns: ['Bulawayo Central', 'Luveve', 'Pumula', 'Cowdray Park'] },
      { name: 'Manicaland', towns: ['Mutare', 'Chipinge', 'Rusape', 'Nyanga'] },
      { name: 'Mashonaland Central', towns: ['Bindura', 'Mazowe', 'Shamva', 'Mt Darwin'] },
      { name: 'Mashonaland East', towns: ['Marondera', 'Murehwa', 'Goromonzi'] },
      { name: 'Mashonaland West', towns: ['Chinhoyi', 'Kadoma', 'Kariba', 'Norton'] },
      { name: 'Masvingo', towns: ['Masvingo', 'Chiredzi', 'Zvishavane border', 'Gutu'] },
      { name: 'Matabeleland North', towns: ['Victoria Falls', 'Hwange', 'Lupane', 'Binga'] },
      { name: 'Matabeleland South', towns: ['Gwanda', 'Beitbridge', 'Plumtree', 'Filabusi'] },
      { name: 'Midlands', towns: ['Gweru', 'Kwekwe', 'Zvishavane', 'Gokwe'] },
    ],
  },
  {
    name: 'Zambia',
    code: 'ZM',
    dialCode: '+260',
    provinces: [
      { name: 'Lusaka', towns: ['Lusaka', 'Chilanga', 'Kafue', 'Chongwe'] },
      { name: 'Copperbelt', towns: ['Ndola', 'Kitwe', 'Chingola', 'Mufulira', 'Luanshya'] },
      { name: 'Southern', towns: ['Livingstone', 'Choma', 'Mazabuka', 'Monze'] },
      { name: 'Central', towns: ['Kabwe', 'Kapiri Mposhi', 'Serenje'] },
      { name: 'Eastern', towns: ['Chipata', 'Petauke', 'Katete', 'Lundazi'] },
      { name: 'Luapula', towns: ['Mansa', 'Kawambwa', 'Nchelenge', 'Samfya'] },
      { name: 'Northern', towns: ['Kasama', 'Mbala', 'Mporokoso'] },
      { name: 'North-Western', towns: ['Solwezi', 'Kasempa', 'Mwinilunga'] },
      { name: 'Western', towns: ['Mongu', 'Kaoma', 'Senanga', 'Sesheke'] },
      { name: 'Muchinga', towns: ['Chinsali', 'Mpika', 'Nakonde', 'Isoka'] },
    ],
  },
  {
    name: 'Botswana',
    code: 'BW',
    dialCode: '+267',
    provinces: [
      { name: 'South-East', towns: ['Gaborone', 'Ramotswa', 'Tlokweng'] },
      { name: 'Kweneng', towns: ['Molepolole', 'Mogoditshane', 'Thamaga'] },
      { name: 'Central', towns: ['Serowe', 'Palapye', 'Mahalapye', 'Bobonong'] },
      { name: 'North-East', towns: ['Francistown', 'Masunga'] },
      { name: 'North-West (Ngamiland)', towns: ['Maun', 'Gumare', 'Shakawe'] },
      { name: 'Southern', towns: ['Kanye', 'Lobatse', 'Goodhope'] },
      { name: 'Kgatleng', towns: ['Mochudi', 'Oodi', 'Bokaa'] },
      { name: 'Chobe', towns: ['Kasane', 'Pandamatenga', 'Kazungula'] },
      { name: 'Ghanzi', towns: ['Ghanzi', 'Charles Hill'] },
      { name: 'Kgalagadi', towns: ['Tsabong', 'Hukuntsi', 'Kang'] },
    ],
  },
  {
    name: 'Malawi',
    code: 'MW',
    dialCode: '+265',
    provinces: [
      { name: 'Central Region', towns: ['Lilongwe', 'Kasungu', 'Salima', 'Dedza', 'Mchinji'] },
      { name: 'Southern Region', towns: ['Blantyre', 'Zomba', 'Mangochi', 'Mulanje', 'Thyolo'] },
      { name: 'Northern Region', towns: ['Mzuzu', 'Karonga', 'Nkhata Bay', 'Rumphi', 'Chitipa'] },
    ],
  },
  {
    name: 'Lesotho',
    code: 'LS',
    dialCode: '+266',
    provinces: [
      { name: 'Maseru District', towns: ['Maseru', 'Roma', 'Mazenod', 'Semonkong'] },
      { name: 'Berea District', towns: ['Teyateyaneng', 'Mapoteng'] },
      { name: 'Leribe District', towns: ['Hlotse', 'Maputsoe'] },
      { name: 'Mafeteng District', towns: ['Mafeteng'] },
      { name: 'Mohale\'s Hoek District', towns: ['Mohale\'s Hoek'] },
      { name: 'Quthing District', towns: ['Quthing', 'Moyeni'] },
      { name: 'Qacha\'s Nek District', towns: ['Qacha\'s Nek'] },
      { name: 'Mokhotlong District', towns: ['Mokhotlong'] },
      { name: 'Thaba-Tseka District', towns: ['Thaba-Tseka'] },
      { name: 'Butha-Buthe District', towns: ['Butha-Buthe'] },
    ],
  },
  {
    name: 'Eswatini (Swaziland)',
    code: 'SZ',
    dialCode: '+268',
    provinces: [
      { name: 'Hhohho', towns: ['Mbabane', 'Piggs Peak', 'Lobamba', 'Bulembu'] },
      { name: 'Manzini', towns: ['Manzini', 'Matsapha', 'Malkerns', 'Bhunya'] },
      { name: 'Lubombo', towns: ['Siteki', 'Big Bend', 'Mhlume', 'Simunye'] },
      { name: 'Shiselweni', towns: ['Nhlangano', 'Hlatikulu', 'Lavumisa'] },
    ],
  },
];
