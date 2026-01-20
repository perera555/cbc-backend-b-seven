import Order from "../models/order.js"


export async function createOrder(req, res) {

    //CBC000001
    /*if (req.user == null) {
        res.status(401).json({
            message: "Unathorized User"
        })
        return
    }*/

    try {

        const orderList = await Order.find().sort({ date: -1 }).limit(1) // last order goes to frist


        let newOrderID = "CBC0000001"

        if (orderList.length != 0) {
            let lastOrderIDInString = orderList[0].orderID //CBC0000123
            let lastOrderNumberInString = lastOrderIDInString.replace("CBC", "") //0000123
            let lastOrderNumber = parseInt(lastOrderNumberInString)
            let newOrderNumber = lastOrderNumber + 1; //0000124
            let newOrderNumberInString = newOrderNumber.toString().padStart(7, "0")//0000124

            newOrderID = "CBC" + newOrderNumberInString //CBC0000124


        }
        const newOrder = new Order({
            orderID: newOrderID,
            items: [],
            customerName: req.body.customerName,
            email: req.body.email,
            phone: req.body.phone,
            address: req.body.address,
            total: req.body.total,
            status: "pending"

        })
       const savedorder =  await newOrder.save()

        res.status(201).json({
            message: "Order Created Successfully "
            
            
        })



    } catch (err) {
        res.status(500).json({
            message: "Internal Server Error"
        })

    }

}