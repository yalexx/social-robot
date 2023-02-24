interface IcampType {
    random: number,
    fanpage_fans: number,
    link_likes: number,
    link_comments: number,
    subscribers: number,
    post_comments: number,
    post_likes: number,
    foto_video_likes: number,
    reviews: number,
    event_participations: number,
    comment_likes: number,
    event_posts: number,
    event_interested: number,
    instagram_follower: number
}

export let CampType: IcampType = {
    random: 0,

    fanpage_fans: 1,
    foto_video_likes: 8,
    event_participations: 11,
    reviews: 9,

    instagram_follower: 24,
    link_likes: 2,
    link_comments: 3,
    subscribers: 4,
    comment_likes: 28,
    event_posts: 32,
    event_interested: 33,
    post_comments: 6,
    post_likes: 7,
};