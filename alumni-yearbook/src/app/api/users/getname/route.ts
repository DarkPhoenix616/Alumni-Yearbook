import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '../../../models/User';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(request: Request) {
    try {
        await dbConnect();

        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get the URL and parse the query params
        const url = new URL(request.url);
        const email = url.searchParams.get('email');

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const name = await User.findOne({
            email: email
        });

        return NextResponse.json({ 
            name: name
        });

    } catch (error) {
        console.error('Error finding name: ', error);
        return NextResponse.json({ error: 'Failed to find name' }, { status: 500 });
    }
}