const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function uploadData() {
  try {
    // Read the JSON data
    const jsonData = fs.readFileSync('your-json-file.json', 'utf8');
    const data = JSON.parse(jsonData);

    // Create WorkoutCeleb
    const workoutCeleb = await prisma.workoutCeleb.create({
      data: {
        name: data.workout_celeb.Name,
        ratings: data.workout_celeb.Ratings,
      },
    });

    // Create Routine
    const routine = await prisma.routine.create({
      data: {
        nameOfDay: data.workout_celeb.Routine.Monday['Name of day'],
        workoutCeleb: { connect: { id: workoutCeleb.id } },
      },
    });

    // Create Exercises
    for (const exerciseData of data.workout_celeb.Routine.Monday.Exercises) {
      const exercise = await prisma.exercise.create({
        data: {
          name: exerciseData.Name,
          type: exerciseData.Type,
          setType: exerciseData['Set Type'] || '',
          restTime: exerciseData['Rest Time'],
          routine: { connect: { id: routine.id } },
        },
      });

      // Create Sets
      for (const setData of exerciseData.Sets) {
        await prisma.set.create({
          data: {
            name: setData.Name,
            type: setData.Type,
            setType: setData['Set Type'] || '',
            volume: setData.Volume,
            weight: setData.Weight,
            restTime: setData['Rest Time'],
            exercise: { connect: { id: exercise.id } },
          },
        });
      }
    }

    console.log('Data uploaded successfully');
  } catch (error) {
    console.error('Error uploading data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

uploadData();
