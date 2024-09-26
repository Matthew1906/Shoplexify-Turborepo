'use client'

import ReviewModal from "./ReviewModal";
import { reviews } from "@prisma/client";
import { useState } from "react";
import { TextButton } from "@repo/ui/buttons";

const ReviewButton = ({slug, review}:{slug:string, review?:reviews|null})=>{
    const [ showReviewForm, setShowReviewForm ] = useState<boolean>(false);
    const openForm = ()=>setShowReviewForm(true);
    const closeForm = ()=>setShowReviewForm(false);
    return <>
        <TextButton text={`${review?"Edit":"Add"} Review`} onClick={openForm}/>
        <ReviewModal slug={slug} show={showReviewForm} onHideModal={closeForm} review={review??null}/>
    </>
}

export default ReviewButton;
