import {PrismaClient} from '@prisma/client'
const fs = require('fs')
const prisma = new PrismaClient()
 
async function Uploader(){
   const structure =fs.readFileSync('../Chris Bumstead/Structure.json','utf8')
   const structure_data=JSON.parse(structure);
    
   const workout_celeb =await prisma.workoutCeleb.create({
    data:{
        name:structure_data.workout_celeb.Name,
        ratings:structure_data.workout_celeb.Ratings,
        
    }
   })
   
   let routineOrder:number=0
   for (const routineData of structure_data.workout_celeb.Routine){
   
    const nameofD:string[]=Object.values(routineData) 
    let weekNames:string  
    weekNames=nameofD[0]
    // structure_for_week.push(nameofD[0])

    const routine = await prisma.routine.create({
        data:{
            weekRoutine:weekNames,
            workoutCeleb:{connect:{id:workout_celeb.id}},
            order:routineOrder
        }

    })
    
   
    const sequence = fs.readFileSync('../Chris Bumstead/'+weekNames+'.json','utf8')
    const sequence_data = JSON.parse(sequence)
    let exerciseOrder :number=0
    for (const exe of sequence_data["Sequence_init"]["Exercises"]){
         
        const exercise = await prisma.exercise.create({
                data:{
                        name:exe["Name"],
                        type:exe["Type"],
                        setType:exe["Set Type"],
                        routine: {connect: {id:routine.id}},
                        order:exerciseOrder
        
        
                    }

                })

        let setOrder:number=0
        for (const seter of exe["Sets"]){
            const set = await prisma.set.create({
                data:{
                    name:seter["Name"],
                    type:seter["Type"],
                    restTime:seter["Rest Time"],
                    volume:seter["Volume"],
                    weight:seter["Weight"],
                    exercise :{connect:{id:exercise.id}},
                    order:setOrder
                }
            })
            setOrder++
            console.log(setOrder)
                }
                setOrder=0
                
        exerciseOrder++
            }
    exerciseOrder=0
    
    routineOrder++
   }
 
    
   
}

async function deleteAll(){
    await prisma.set.deleteMany()
    await prisma.exercise.deleteMany()
    await prisma.routine.deleteMany()
    const getter=await prisma.workoutCeleb.deleteMany()
    console.log("dd")
    console.log(getter)
}

async function getWorkout(){
    let celeb:string="Chris Bumstead"
   const get= await prisma.workoutCeleb.findMany({
    where:{
        name: celeb
    }
   })
    
   const workout = await prisma.workoutCeleb.findUnique({
    where :{id:25},
    include:{
        routines:{
            include:{
                exercises:{
                    include:{
                        sets:true
                    }
                }
            }
        }
    }
   })
   if (workout !== null && workout.routines !== null ){
    console.log(workout["routines"][0]["exercises"])
   }
}
console.log("ddss")
getWorkout().
    then(async()=>
    {
        await prisma.$disconnect()
    }).catch(async(e)=>{
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })