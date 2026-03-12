import { useState } from "react";

function App() {

const [petroleo,setPetroleo]=useState("")
const [mezcla,setMezcla]=useState("")
const [aceite,setAceite]=useState("")

const [porcPetroleo,setPorcPetroleo]=useState(70)
const [porcAceite,setPorcAceite]=useState(30)

const capPetroleo=20
const capMezcla=30
const capAceite=20

const dispPetroleo=capPetroleo-(Number(petroleo)||0)
const dispMezcla=capMezcla-(Number(mezcla)||0)
const dispAceite=capAceite-(Number(aceite)||0)

const nivelPetroleo = ((Number(petroleo)||0)/capPetroleo)*100
const nivelMezcla = ((Number(mezcla)||0)/capMezcla)*100
const nivelAceite = ((Number(aceite)||0)/capAceite)*100



const faltanteMezcla=capMezcla-(Number(mezcla)||0)

const petroleoNecesario=faltanteMezcla*(porcPetroleo/100)
const aceiteNecesario=faltanteMezcla*(porcAceite/100)

return (

<div className="min-h-screen bg-gray-100 p-8">

<div className="max-w-5xl mx-auto">

<h1 className="text-4xl font-bold text-blue-600 mb-8">
Planta ARL
</h1>

{/* MEDICIONES */}

<div className="grid md:grid-cols-3 gap-6">

<div className="bg-white p-6 rounded-xl shadow">
<h2 className="font-semibold mb-3">Petróleo</h2>

<input
type="number"
placeholder="m³"
value={petroleo}
onChange={e=>setPetroleo(e.target.value)}
className="w-full border rounded p-2"
/>

<p className="mt-3 text-sm text-gray-500">
Disponible: {dispPetroleo.toFixed(2)} m³
</p>

<div className="w-full bg-gray-200 rounded-full h-4 mt-3">
  <div
    className="bg-green-500 h-4 rounded-full"
    style={{ width: `${nivelPetroleo}%` }}
  ></div>
</div>

<p className="text-sm mt-1">
  {nivelPetroleo.toFixed(0)} %
</p>

</div>

<div className="bg-white p-6 rounded-xl shadow">

<h2 className="font-semibold mb-3">Mezcla</h2>

<input
type="number"
placeholder="m³"
value={mezcla}
onChange={e=>setMezcla(e.target.value)}
className="w-full border rounded p-2"
/>

<p className="mt-3 text-sm text-gray-500">
Disponible: {dispMezcla.toFixed(2)} m³
</p>

<div className="w-full bg-gray-200 rounded-full h-4 mt-3">
  <div
    className="bg-blue-500 h-4 rounded-full"
    style={{ width: `${nivelMezcla}%` }}
  ></div>
</div>

<p className="text-sm mt-1">
  {nivelMezcla.toFixed(0)} %
</p>

</div>

<div className="bg-white p-6 rounded-xl shadow">

<h2 className="font-semibold mb-3">Aceite Residual</h2>

<input
type="number"
placeholder="m³"
value={aceite}
onChange={e=>setAceite(e.target.value)}
className="w-full border rounded p-2"
/>

<p className="mt-3 text-sm text-gray-500">
Disponible: {dispAceite.toFixed(2)} m³
</p>

<div className="w-full bg-gray-200 rounded-full h-4 mt-3">
  <div
    className="bg-yellow-500 h-4 rounded-full"
    style={{ width: `${nivelAceite}%` }}
  ></div>
</div>

<p className="text-sm mt-1">
  {nivelAceite.toFixed(0)} %
</p>

</div>

</div>

{/* PORCENTAJES */}

<div className="bg-white p-6 rounded-xl shadow mt-8">

<h2 className="text-lg font-semibold mb-4">
Porcentaje de Mezcla
</h2>

<div className="grid grid-cols-2 gap-4">

<input
type="number"
value={porcPetroleo}
onChange={e=>setPorcPetroleo(Number(e.target.value))}
className="border rounded p-2"
/>

<input
type="number"
value={porcAceite}
onChange={e=>setPorcAceite(Number(e.target.value))}
className="border rounded p-2"
/>

</div>

</div>

{/* RESULTADO */}

<div className="bg-white p-6 rounded-xl shadow mt-8">

<h2 className="text-lg font-semibold mb-4">
Para llenar estanque de mezcla
</h2>

<div className="grid md:grid-cols-2 gap-6">

<div className="bg-blue-100 p-4 rounded-lg">
<p className="text-sm text-gray-600">Petróleo necesario</p>
<p className="text-2xl font-bold">
{petroleoNecesario.toFixed(2)} m³
</p>
</div>

<div className="bg-yellow-100 p-4 rounded-lg">
<p className="text-sm text-gray-600">Aceite necesario</p>
<p className="text-2xl font-bold">
{aceiteNecesario.toFixed(2)} m³
</p>
</div>

</div>

</div>

{/* TABLA */}

<div className="bg-white p-6 rounded-xl shadow mt-8">

<h2 className="text-lg font-semibold mb-4">
Resumen
</h2>

<table className="w-full">

<thead>
<tr className="text-left border-b">
<th className="pb-2">Estanque</th>
<th className="pb-2">Stock</th>
<th className="pb-2">Disponible</th>
</tr>
</thead>

<tbody>

<tr className="border-b">
<td className="py-2">Petróleo</td>
<td>{petroleo || 0}</td>
<td>{dispPetroleo.toFixed(2)}</td>
</tr>

<tr className="border-b">
<td className="py-2">Mezcla</td>
<td>{mezcla || 0}</td>
<td>{dispMezcla.toFixed(2)}</td>
</tr>

<tr>
<td className="py-2">Aceite</td>
<td>{aceite || 0}</td>
<td>{dispAceite.toFixed(2)}</td>
</tr>

</tbody>

</table>

</div>

</div>

</div>

)

}

export default App