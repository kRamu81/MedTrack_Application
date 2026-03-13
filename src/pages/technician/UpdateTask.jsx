import { useState,useEffect } from "react";

export default function UpdateTask({onNavigate}){

const [form,setForm]=useState({status:"In Progress",notes:"",parts:[],hours:"",image:null});
const [part,setPart]=useState("");
const [preview,setPreview]=useState(null);
const [saved,setSaved]=useState(false);
const [done,setDone]=useState(false);

const steps=["Inspection","Repair","Testing","Completed"];
const step=form.status==="Completed"?4:form.status==="In Progress"?2:1;
const progress=(step/4)*100;

useEffect(()=>{
const t=setTimeout(()=>{
localStorage.setItem("draft",JSON.stringify(form));
setSaved(true);
setTimeout(()=>setSaved(false),1000);
},800);
return()=>clearTimeout(t);
},[form]);

const addPart=()=>{
if(!part.trim())return;
setForm({...form,parts:[...form.parts,part]});
setPart("");
};

const removePart=i=>{
setForm({...form,parts:form.parts.filter((_,x)=>x!==i)});
};

const upload=e=>{
const f=e.target.files[0];
if(!f)return;
setForm({...form,image:f});
setPreview(URL.createObjectURL(f));
};

const submit=e=>{
e.preventDefault();
setDone(true);
setTimeout(()=>onNavigate("tasks"),2000);
};

return(

<div className="min-h-screen relative bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#60a5fa]">

<div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_40%)]"></div>

<div className="relative max-w-6xl mx-auto px-6 py-10">

<button onClick={()=>onNavigate("tasks")} className="text-white mb-6">
← Back to Tasks
</button>

<div className="grid lg:grid-cols-3 gap-8">

<div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-8">

<h1 className="text-2xl font-bold">Update Maintenance Task</h1>
<p className="text-sm text-gray-500 mb-6">Submit technician repair report</p>

<div className="mb-8">

<div className="flex justify-between mb-2">
{steps.map((s,i)=>(
<div key={s} className="flex flex-col items-center w-full">
<div className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-bold ${i+1<=step?"bg-blue-600 text-white":"bg-gray-200 text-gray-500"}`}>{i+1}</div>
<p className="text-xs mt-1">{s}</p>
</div>
))}
</div>

<div className="w-full bg-gray-200 h-2 rounded-full">
<div style={{width:`${progress}%`}} className="h-2 rounded-full bg-blue-600"/>
</div>

</div>

{done?(
<div className="text-center py-14">
<div className="text-5xl mb-4">✅</div>
<p className="text-xl font-bold">Update Submitted</p>
<p className="text-gray-500 text-sm">Returning to tasks...</p>
</div>
):( 

<form onSubmit={submit} className="space-y-5">

<select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} className="w-full p-3 border rounded-lg">
<option>In Progress</option>
<option>Needs Part</option>
<option>On Hold</option>
<option>Completed</option>
</select>

<textarea rows="4" placeholder="Describe repair work..." value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} className="w-full p-3 border rounded-lg"/>

<div>
<div className="flex gap-2">
<input value={part} onChange={e=>setPart(e.target.value)} placeholder="Add spare part" className="flex-1 p-3 border rounded-lg"/>
<button type="button" onClick={addPart} className="px-4 bg-blue-600 text-white rounded-lg">Add</button>
</div>

<div className="flex flex-wrap gap-2 mt-3">
{form.parts.map((p,i)=>(
<span key={i} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs flex items-center gap-1">
{p}
<button type="button" onClick={()=>removePart(i)} className="text-red-500">✕</button>
</span>
))}
</div>
</div>

<input type="number" step="0.5" placeholder="Hours spent" value={form.hours} onChange={e=>setForm({...form,hours:e.target.value})} className="w-full p-3 border rounded-lg"/>

<div>
<input type="file" onChange={upload}/>
{preview&&<img src={preview} className="mt-3 h-40 rounded-xl object-cover shadow"/>}
</div>

<button className="w-full py-3 text-white font-semibold rounded-lg bg-blue-600">
Submit Update
</button>

{saved&&<p className="text-xs text-green-600">Draft auto-saved</p>}

</form>
)}

</div>

<div className="bg-white rounded-2xl shadow-xl p-6 h-fit">

<h2 className="font-bold mb-4">Equipment Details</h2>

<img src="data:image/webp;base64,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" className="w-full h-44 rounded-xl object-cover mb-4"/>

<p className="text-sm text-gray-500">Equipment</p>
<p className="font-semibold">Ventilator B05</p>

<p className="text-sm text-gray-500 mt-3">Hospital</p>
<p className="font-semibold">Apollo Medical Center</p>

<p className="text-sm text-gray-500 mt-3">Priority</p>

<span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-semibold">
Critical
</span>

</div>

</div>

</div>
</div>
);
}
