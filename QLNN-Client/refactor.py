import re

with open('src/components/households/HouseholdModal.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

initial_form_data = '''const INITIAL_FORM_DATA = {
  villageId: '',
  fullName: '',
  notes: '',
  cafeHousehold: '0',
  cafeContracted: '0',
  rubberHousehold: '0',
  rubberContracted: '0',
  fruitTree: '0',
  macadamia: '0',
  herbDinhLang: '0',
  herbGung: '0',
  herbNghe: '0',
  herbSa: '0',
  wetRice: '0',
  otherAnnualCrops: '0',
  buffalo: '0',
  cow: '0',
  pig: '0',
  poultry: '0',
  fishPond: '0',
  fishCage: '0',
};'''

new_state_hooks = initial_form_data + '''

  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof typeof INITIAL_FORM_DATA) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  useEffect(() => {
    if (isOpen) {
      if (household) {
        setFormData({
          villageId: household.village_id || '',
          fullName: household.full_name || '',
          notes: household.notes || '',
          cafeHousehold: String(household.cafe_household ?? 0),
          cafeContracted: String(household.cafe_contracted ?? 0),
          rubberHousehold: String(household.rubber_household ?? 0),
          rubberContracted: String(household.rubber_contracted ?? 0),
          fruitTree: String(household.fruit_tree ?? 0),
          macadamia: String(household.macadamia ?? 0),
          herbDinhLang: String(household.herb_dinh_lang ?? 0),
          herbGung: String(household.herb_gung ?? 0),
          herbNghe: String(household.herb_nghe ?? 0),
          herbSa: String(household.herb_sa ?? 0),
          wetRice: String(household.wet_rice ?? 0),
          otherAnnualCrops: String(household.other_annual_crops ?? 0),
          buffalo: String(household.buffalo ?? 0),
          cow: String(household.cow ?? 0),
          pig: String(household.pig ?? 0),
          poultry: String(household.poultry ?? 0),
          fishPond: String(household.fish_pond ?? 0),
          fishCage: String(household.fish_cage ?? 0),
        });
      } else {
        setFormData({
          ...INITIAL_FORM_DATA,
          villageId: user?.role === 'user' && user.village_id ? user.village_id : villages[0]?.id || '',
        });
      }
      setActiveTab('crops');
      setError(null);
    }
  }, [isOpen, household, user, villages]);'''

code = re.sub(
    r'const \[villageId.*?setActiveTab\(\'crops\'\);\n      setError\(null\);\n    \}\n  \}, \[isOpen, household, user, villages\]\);',
    new_state_hooks,
    code,
    flags=re.DOTALL
)

fields = [
    'villageId', 'fullName', 'notes',
    'cafeHousehold', 'cafeContracted', 'rubberHousehold', 'rubberContracted',
    'fruitTree', 'macadamia', 'herbDinhLang', 'herbGung', 'herbNghe', 'herbSa',
    'wetRice', 'otherAnnualCrops', 'buffalo', 'cow', 'pig', 'poultry',
    'fishPond', 'fishCage'
]

for field in fields:
    code = code.replace(f'value={{{field}}}', f'value={{formData.{field}}}')
    set_field = 'set' + field[0].upper() + field[1:]
    code = code.replace(f'onChange={{(e) => {set_field}(e.target.value)}}', f'onChange={{handleChange(\'{field}\')}}')
    code = code.replace(f'parseFloat({field})', f'parseFloat(formData.{field})')
    code = code.replace(f'parseInt({field}, 10)', f'parseInt(formData.{field}, 10)')
    code = code.replace(f'    {field},\n', f'    formData.{field},\n')
    
code = code.replace('    otherAnnualCrops,\n', '    formData.otherAnnualCrops,\n')
code = code.replace('    otherAnnualCrops\n', '    formData.otherAnnualCrops\n')

# handle livestock array
code = code.replace('[buffalo, cow, pig, poultry]', '[formData.buffalo, formData.cow, formData.pig, formData.poultry]')

code = code.replace('!fullName.trim()', '!formData.fullName.trim()')
code = code.replace('!villageId', '!formData.villageId')
code = code.replace('village_id: villageId', 'village_id: formData.villageId')
code = code.replace('full_name: fullName.trim()', 'full_name: formData.fullName.trim()')
code = code.replace('notes: notes.trim()', 'notes: formData.notes.trim()')
code = code.replace('Hộ "${fullName.trim()}"', 'Hộ "${formData.fullName.trim()}"')
code = code.replace('v.id === villageId', 'v.id === formData.villageId')

with open('src/components/households/HouseholdModal.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print('Done')
