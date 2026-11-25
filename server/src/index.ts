import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'

const app=express()
const port=Number(process.env.PORT||4000)
app.use(helmet())
app.use(cors({origin:(process.env.CLIENT_ORIGIN||'http://localhost:5173').split(',').map(s=>s.trim())}))
app.use(express.json({limit:'30kb'}))
app.use('/api/compile',rateLimit({windowMs:60_000,max:10,standardHeaders:true,legacyHeaders:false}))
app.get('/api/health',(_req,res)=>res.json({ok:true,service:'c-code-quest-api'}))

type Test={input:string;expected:string}
app.post('/api/compile',async(req,res)=>{
  const {source,tests}=req.body as {source?:string;tests?:Test[]}
  if(typeof source!=='string'||source.length<1||source.length>20000)return res.status(400).json({error:'Source code must be between 1 and 20,000 characters.'})
  if(!Array.isArray(tests)||tests.length<1||tests.length>10||tests.some(t=>typeof t.input!=='string'||typeof t.expected!=='string'))return res.status(400).json({error:'Invalid test cases.'})
  const base=(process.env.JUDGE0_URL||'').replace(/\/$/,'')
  if(!base)return res.status(503).json({error:'Judge0 is not configured. Set JUDGE0_URL on the API server.'})
  const headers:Record<string,string>={'Content-Type':'application/json'}
  if(process.env.JUDGE0_API_KEY)headers['X-Auth-Token']=process.env.JUDGE0_API_KEY
  try{
    const results=[]
    for(const test of tests){
      const submit=await fetch(`${base}/submissions?base64_encoded=false&wait=true`,{
        method:'POST',headers,
        body:JSON.stringify({source_code:source,language_id:Number(process.env.JUDGE0_LANGUAGE_ID||50),stdin:test.input,cpu_time_limit:2,wall_time_limit:5,memory_limit:128000})
      })
      if(!submit.ok)throw new Error(`Judge0 returned HTTP ${submit.status}`)
      const data:any=await submit.json()
      const stdout=(data.stdout||'').trim().replace(/\r\n/g,'\n')
      const expected=test.expected.trim().replace(/\r\n/g,'\n')
      results.push({passed:data.status?.id===3&&stdout===expected,stdout,expected,status:data.status?.description,stderr:data.stderr,compile_output:data.compile_output})
    }
    const passed=results.every(r=>r.passed)
    res.json({passed,results,message:passed?'All test cases passed!':results.map((r,i)=>`Test ${i+1}: ${r.status||'Unknown'}\n${r.compile_output||r.stderr||`Expected: ${r.expected}\\nReceived: ${r.stdout}`}`).join('\n\n')})
  }catch(err){
    res.status(502).json({error:err instanceof Error?err.message:'Compiler service unavailable'})
  }
})
app.listen(port,()=>console.log(`C Code Quest API listening on ${port}`))
