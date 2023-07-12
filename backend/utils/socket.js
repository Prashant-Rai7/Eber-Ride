const  socketio  = require('socket.io');
const { mongoose } = require('mongoose')
const driverModel = require('../models/driver')
const createrideModel = require("../models/createride")

async function initializeSocket(server) {
    const io = socketio(server, {cors: {origin: ["http://localhost:4200"]}});

    io.on("connection", (socket) => {
        console.log("Socket is Running.");


      // --------------------------------------------------------UPDATE DRIVER STATUS--------------------------------------------------------//
      socket.on('driverstatus', async (data) => {
          const { driverId, status } = data;
          // console.log(data)

          try {
              const data = await driverModel.findByIdAndUpdate(driverId, { status },  {new: true});
              io.emit('statusdata', { success: true, data, message: 'Driver Status Updated Successfully.' });
          } 
          catch (error) {
              io.emit('statusdata', { success: false, message: error });
            }
          });

      // --------------------------------------------------------UPDATE DRIVER SERVICE TYPE--------------------------------------------------------//
      socket.on('driverService', async (data) => {
          const { driverId, servicetype } = data;
              console.log(data);

          try {
              const existingService = await driverModel.findByIdAndUpdate(driverId, { servicetype },  {new: true});
              io.emit('servicedata', { success: true, message: 'Service Updated Successfully', existingService });
          } 
          catch (error) {
              io.emit('servicedata', { success: false, message: error });
            }
          });



      // ------------------------------------------------DRIVERS OF PARTICULAR CITY AND SERVICE ,STATUS TRUE------------------------------------//
      socket.on('driverdata', async (data) => {
          // console.log(data , "assigndriverdata");

      try {
        const cityId = new mongoose.Types.ObjectId(data.cityId);
        const serviceId = new mongoose.Types.ObjectId(data.serviceId);

        const aggregationPipeline = [
          {
            $lookup: {
              from: 'citymodels',
              localField: 'city',
              foreignField: '_id',
              as: 'cityDetails'
            }
          },
          {
            $unwind: "$cityDetails"
          },
          {
            $lookup: {
              from: 'vehiclemodels',
              localField: 'servicetype',
              foreignField: '_id',
              as: 'serviceDetails'
            }
          },
          {
            $unwind: {path:"$serviceDetails",
            preserveNullAndEmptyArrays: true}
          },
          {
            $match: {
                city: cityId,
                servicetype: serviceId,
                status: true,
                assign: "0"
              },
          },
    
        ];
        const driverdata = await driverModel.aggregate(aggregationPipeline).exec()
        // console.log(driverdata , "driverdataresponse");
        io.emit('driverdata', driverdata , {success: true, message: "Driver Assigned Successfully"});
        
      } catch (error) { 
          console.log(error);
          io.emit('driverdata', { success: false, message: error });
      }
    })

      // ------------------------------------------------SHOW DRIVER DATA AFTER ASSIGN-----------------------------------------------//
      socket.on("AssignedData", async(data) => {
        const rideId = data.rideId
        const driverId = data.driverId

        
        try {
          const driver =  await driverModel.findByIdAndUpdate(driverId, { assign: "1" }, { new: true });
          const updatedRide = await  createrideModel.findByIdAndUpdate(rideId, {driverId: driverId}, { new: true })
          const ride = await createrideModel.aggregate([
            {
              $match: {
                _id: updatedRide._id
              }
            },
            {
              $lookup: {
                from: "drivermodels",
                localField: "driverId",
                foreignField: "_id",
                as: "driverDetails"
              }
            },
            {
              $unwind: "$driverDetails"
            },
          ]);
        

          // console.log(ride);

          io.emit('data', { success: true, ride , message: 'Driver Assigned Successfully.' });
          
        } catch (error) {
            console.log(error);
            io.emit('data', { success: false, message: error });
        }
      })

      // ------------------------------------------------DRIVER RUNNING REQUEST TABLE-----------------------------------------------//
      
      socket.on("runningrequest", async(data) => {
        const driverId = data.driverId
        // console.log(data);

        try {
          const driverdata = await driverModel.find({ assign: "1" });
          const ridedata = await createrideModel.find({  driverId: { $exists: true } });
          // console.log("ridedata",ridedata);
          // console.log("driverdata",driverdata);
          io.emit('runningdata', {driverdata, ridedata }, {success: true, message: "Running Request Data"});

        } catch (error) {
          console.error(error);
          io.emit('runningdata', { success: false, message: "Error retrieving data" });
        }

      })


      // ------------------------------------------------RIDE REJECTED REQUEST TABLE-----------------------------------------------//
        socket.on("runningrequestReject", async (data) => {
          const driverId = data.driverId;

          try {
            // Update assign value to 0 and unset driverId field
            await createrideModel.updateMany({ driverId: { $exists: true } }, { $set: { assign: "0" }, $unset: { driverId: "" } });
        
            const driverdata = await driverModel.find({ assign: "0" });
            const ridedata = await createrideModel.find({ driverId: { $exists: false } });
        
            io.emit('notrunningdata', { driverdata, ridedata }, { success: true, message: "Running Request Reject Data" });
          } catch (error) {
            console.error(error);
            io.emit('notrunningdata', { success: false, message: "Error retrieving data" });
          }
        });




      socket.on("disconnect", () => {
          console.log("client Disconnected");
      });

    
    });
};



module.exports = initializeSocket;