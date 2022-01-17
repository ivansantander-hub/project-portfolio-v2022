///////TIME-LINE BANNER
gsap.registerPlugin(ScrollTrigger);
var timeLine = gsap.timeline({
    scrollTrigger:{
        trigger: '.section-1',
        markers: false,
        start: 'top top',
        end: 'bottom',
        scrub: 5,
        pin: '.banner'
    }
});

timeLine.to(".gsap-1",{
    x:'-50vw',
    duration:5,
})

timeLine.to(".about-me",{
    x:'-75vw',
    duration:5,
    delay:2
}, "<")

timeLine.to(".about-me",{
    x:'-300vw',
    duration:5,
}, ">")

timeLine.to(".title-banner",{
    opacity:0,
    duration:1,
}, "<")

timeLine.to(".gsap-1",{
    x:'-25vw',
    duration:2,
}, "<")

timeLine.to(".gsap-1",{
    y: '150vh',
    duration:10,
    delay:5
}, "<")

timeLine.to(".banner",{
    opacity:0,
    y: '-150vh',
    duration:5,
}, "<")

timeLine.from(".portafolio",{
    opacity: 0,
    duration:15,
    delay:2
},"<")

timeLine.from(".projects-title",{
    opacity: 0,
    y: '+30vh',
    duration:20,
    delay:3
},"<")

timeLine.to(".projects-title-1",{
    duration:25,
    x: '-=80%'
},"<")

timeLine.to(".projects-title-2",{
    duration:25,
    x: '+=80%'
},"<")

timeLine.from(".projects-title-3",{
    duration:25,
    x: '+=80%'
},"<")

timeLine.from(".projects-title-4",{
    duration:25,
    x: '-=80%'
},"<")


timeLine.to(".projects-title",{
    opacity: 0,
    duration:15,
    delay:3
},">")
///////TIME-LINE BE4CARE

var timeLine2 = gsap.timeline({
    scrollTrigger:{
        trigger: '.be4care',
        pin: ".gsap-2",
        markers: false,
        start: '200px bottom',
        end: 'bottom bottom',
        scrub: 5,
    },
});

timeLine2.from(".be4care",{
    opacity:0,
    duration:5,
})



timeLine2.to(".card-portafolio-1",{
    y:"18vh",
    duration:35,
},"<")

timeLine2.to(".card-portafolio-2",{
    y:"22vh",
    duration:35,
},"<")

timeLine2.to(".card-portafolio-3",{
    y:"22vh",
    duration:35,
},"<")

timeLine2.to(".card-portafolio-4",{
    y:"18vh",
    duration:35,
},"<")


///////TIME-LINE BE4TECH

var timeLine3 = gsap.timeline({
    scrollTrigger:{
        trigger: '.be4tech',
        pin: ".gsap-3",
        markers: false,
        start: '200px bottom',
        end: '=+800px bottom',
        scrub: 15,
        delay: 2
    },
});



timeLine3.from(".gsap-3",{
    x:"100vw",
    opacity: 0,
    duration:30,
    delay:2
},"<")

timeLine3.from(".card-portafolio-be4tech-2",{
    x:"-150vw",
    opacity: 0,
    duration:35,
    delay:4
},"<")

timeLine3.from(".card-portafolio-be4tech-1",{
    x:'-150vh',
    opacity:0,
    duration:40,
    delay:2
},"<")

timeLine3.to(".card-portafolio-be4tech",{
    y:"-10vw",
    duration:55,
    delay:4
},">")

///////TIME-LINE IROCKET

var timeLine4 = gsap.timeline({
    scrollTrigger:{
        trigger: '.irocket',
        pin: ".gsap-4",
        markers: true,
        start: '300px bottom',
        end: '=+800px bottom',
        scrub: 5,
        delay: 2
    },
});

timeLine4.from(".gsap-4",{
    x:"50vw",
    opacity:0,
    duration:10,
    delay:5
},"<")


timeLine4.from(".card-portafolio-irocket-1",{
    x:'-85vw',
    opacity:0,
    duration:20,
    delay:5
},"<")

timeLine4.from(".card-portafolio-irocket-2",{
    x:'-85vw',
    opacity:0,
    duration:15,
    delay:3
},"<")
