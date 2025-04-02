import { useEffect, useState } from "react";
import { Call, useStreamVideoClient } from "@stream-io/video-react-sdk";

export const useGetCallById = (id) => {
    const [call, setCall] = useState(null);
    const [isCallLoading, setIsCallLoading] = useState(true);
    const client = useStreamVideoClient(); // ✅ Hook at the top level

    useEffect(() => {
        if (!client || !id) return; // ✅ Ensure id exists

        const loadCall = async () => {
            try {
                const { calls } = await client.queryCalls({
                    filter_conditions: { id }
                });

                if (calls.length > 0) setCall(calls[0]);
            } catch (error) {
                console.error("Error fetching call:", error);
            } finally {
                setIsCallLoading(false);
            }
        };

        loadCall();
    }, [client, id]);

    return { call, isCallLoading };
};
