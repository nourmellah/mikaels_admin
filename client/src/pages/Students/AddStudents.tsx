/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import api from '../../api';
import InputField from '../../components/form/input/InputField';
import FileInput from '../../components/form/input/FileInput';
import Label from '../../components/form/Label';
import ComponentCard from '../../components/common/ComponentCard';
import Switch from '../../components/form/switch/Switch';
import PhoneInput from '../../components/form/group-input/PhoneInput';
import Select from '../../components/form/Select';

export default function AddStudentPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('99 999 999');
  const [groupId, setGroupId] = useState('');
  const [level, setLevel] = useState('');
  const [hasCv, setHasCv] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [groups, setGroups] = useState<{ value: string; label: string }[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const countries = [
    { code: 'TN', label: '+216' }
  ];

  const handlePhoneNumberChange = (phoneNumber: string) => {
    setPhone(phoneNumber);
  };

  // Fetch groups (include "no group" option)
  useEffect(() => {
    api.get('/groups')
      .then(res => {
        setGroups([
          { value: '', label: 'Aucun groupe' },
          ...res.data.map((g: any) => ({ value: String(g.id), label: g.name }))
        ]);
      })
      .catch(console.error);
  }, []);

  // Validate mandatory fields only
  const validate = () => {
    const errs: Record<string, string> = {};
    if (!firstName.trim()) errs.firstName = 'Le prénom est requis.';
    if (!lastName.trim()) errs.lastName = 'Le nom est requis.';
    if (!email) errs.email = 'Le courriel est requis.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Format de courriel invalide.';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});

    const payload = {
      firstName,
      lastName,
      email,
      phone,
      groupId: groupId || null,
      level: level || null,
      hasCv
    };

    try {
      await api.post('/students', payload);
      navigate('/students', { replace: true });
    } catch (err: any) {
      console.error('Create student error:', err);
      setErrors({ submit: err.response?.data?.message || 'Une erreur est survenue, veuillez réessayer.' });
    }
  };

  return (
    <>
      <PageMeta title="Ajouter un étudiant" description="Formulaire d'ajout d'un nouvel étudiant" />
      <PageBreadcrumb pageTitle="Ajouter un étudiant" />

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="space-y-6">

          <ComponentCard title="Informations personnelles">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Prénom</Label>
                <InputField id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} />
                {errors.firstName && <p className="text-red-600 text-sm">{errors.firstName}</p>}
              </div>
              <div>
                <Label>Nom</Label>
                <InputField id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} />
                {errors.lastName && <p className="text-red-600 text-sm">{errors.lastName}</p>}
              </div>
              <div className="md:col-span-2">
                <Label>E-mail</Label>
                <InputField type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} />
                {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}
              </div>
              {/* Phone Input with proper usage */}
              <div className="md:col-span-2">
                <Label>Téléphone</Label>
                <PhoneInput
                  selectPosition="start"
                  countries={countries}
                  placeholder="+1 (555) 000-0000"
                  onChange={handlePhoneNumberChange}
                />
              </div>
              <div className="md:col-span-2">
                <Label>Photo de profil</Label>
                <FileInput onChange={e => setImageFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)} />
              </div>
            </div>
          </ComponentCard>
          </div>  
          <div className="space-y-6">
          <ComponentCard title="Informations académiques">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Groupe</Label>
                <Select options={groups} onChange={setGroupId} />
                {errors.groupId && <p className="text-red-600 text-sm">{errors.groupId}</p>}
              </div>
              <div>
                <Label>Niveau</Label>
                <Select
                  options={[
                    { value: '0' , label: '0'  },
                    { value: 'A1', label: 'A1' },
                    { value: 'A2', label: 'A2' },
                    { value: 'B1', label: 'B1' },
                    { value: 'B2', label: 'B2' },
                    { value: 'C1', label: 'C1' },
                    { value: 'C2', label: 'C2' }
                  ]}
                  onChange={setLevel}
                />
              </div>
              <div className="md:col-span-2 flex items-center gap-2">
                <Switch onChange={() => setHasCv(prev => !prev)} label={''} />
                <Label>CV fourni</Label>
              </div>
            </div>
          </ComponentCard>

          {errors.submit && <p className="text-red-600 text-center">{errors.submit}</p>}

          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Ajouter l'étudiant
          </button>
          </div>
        </div>
        
      </form>
    </>
  );
}

