import {BadRequestException, ConflictException, Injectable, Logger} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {StudentRepository} from "./student.repository";
import {User} from "../auth/user.entity";
import {Darshika} from "./darshika.entity";
import * as Razorpay from "razorpay";
import * as crypto from "crypto";
import * as config from 'config';
import {LessThanOrEqual} from "typeorm/index";
import {Agent} from "../agent/agent.entity";


const RazorpayConfig = config.get('razorpay');

@Injectable()
export class StudentService {
    constructor(
        @InjectRepository(StudentRepository)
        private repository: StudentRepository
    ) {
    }

    private logger = new Logger("StudentService");

    async getDarshikas(user: User) {
        const sub = await this.getSubscription(user)
        if (!sub.subscribed) return sub;

        sub.darshikas = await this.getMyDarshikas(user.student.paid_at);
        return sub;
    }

    async getSubscription(user: User) {
        const paid_at = user.student.paid_at
        if (!paid_at) return {
            subscribed: false,
            paid_at: null,
            expiry: null,
            next_darshika: null,
            darshikas: await Darshika.find({
                where: {
                    serial_no: 0
                }
            }),
            ancestor: await Agent.findOne({
                where: {
                    id: user.student.ancestor_id
                },
                select: ["id", "referral_code", "name"]
            }),
            activation_requested: user.student.activation_requested
        }
        const t = paid_at.getTime()
        const begin = new Date(t);
        const expiry = new Date(t);
        const currentDate = new Date();
        expiry.setFullYear(expiry.getFullYear() + 1);
        return {
            subscribed: !!paid_at && (begin < currentDate) && (expiry > currentDate),
            paid_at: new Date(t),
            expiry,
            next_darshika: new Date(t),
            darshikas: [],
        }
    }

    async getMyDarshikas(paid_at: Date) {
        return await Darshika.find({
            where: {
                serial_no: LessThanOrEqual(this.lastDarshikaNumber(paid_at) + 1)
            },
            order: {
                serial_no: "DESC"
            }
        });
    }

    lastDarshikaNumber(paid_at: Date) {
        const now = new Date()
        let months;
        months = (now.getFullYear() - paid_at.getFullYear()) * 12;
        months -= paid_at.getMonth();
        months += now.getMonth();
        months = months > 12 ? 12 : months
        return months <= 0 ? 0 : months;
    }

    async initializeSubscription(user: User) {
        const subscription = await this.getSubscription(user);
        if (subscription.subscribed) throw new ConflictException("Already Subscribed!");
        const instance = new Razorpay({key_id: RazorpayConfig.keyId, key_secret: RazorpayConfig.keySecret});

        const options = {
            amount: 36000,
            currency: "INR",
        };
        const order = await instance.orders.create(options);
        user.student.razorpay_order_id = order.order_id;
        // user.student.paid_at = new Date();
        await user.student.save();
        return order;
    }

    async verifyRazorpaySignature(payment_response) {
        const hmac = await crypto.createHmac('sha256', RazorpayConfig.keySecret);
        hmac.update(payment_response.order_id + "|" + payment_response.payment_id);
        const generatedSignature = await hmac.digest('hex');
        if (generatedSignature !== payment_response.signature) {
            throw new BadRequestException('Payment Verification Failed!')
        }
    }

    async onPaymentDone(user: User, paymentResponse) {
        await this.verifyRazorpaySignature(paymentResponse);
        user.student.paid_at = new Date();
        user.student.activation_requested = false;
        await user.student.save();
    }

    async updateAncestor(user: User, referralCode: string) {
        const ancestor = await Agent.findOne({
            where: {
                referral_code: referralCode
            }
        });
        if (!ancestor) throw new BadRequestException('Wrong Referral Code!')
        user.student.ancestor_id = ancestor.id
        user.student.ancestry = `${ancestor.ancestry}${ancestor.id}/`;
        await user.save();
        return {
            id: ancestor.id,
            referral_code: ancestor.referral_code,
            name: ancestor.name
        }
    }

    async requestActivation(user: User) {
        user.student.activation_requested = true;
        await user.student.save();
        return;
    }
}