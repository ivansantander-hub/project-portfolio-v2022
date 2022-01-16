// gsap.from(".banner",{
//     y:"-100vh",
//     opacity:0,
//     duration:3,
//     delay:4
// })
gsap.registerPlugin(ScrollTrigger);
// var timeLine = gsap.timeline()
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

timeLine.from(".portafolio",{
    opacity: 0,
    duration:15,
    delay:2
},"<")

timeLine2.to(".card-portafolio-1",{
    y:"3vh",
    duration:35,
},"<")

timeLine2.to(".card-portafolio-2",{
    y:"8vh",
    duration:35,
},"<")

timeLine2.to(".card-portafolio-3",{
    y:"8vh",
    duration:35,
},"<")

timeLine2.to(".card-portafolio-4",{
    y:"3vh",
    duration:35,
},"<")


timeLine2.to(".card-portafolio-1",{
    y:"-35vh",
    duration:35,
    delay:2
})

timeLine2.to(".card-portafolio-2",{
    y:"-40vh",
    duration:35,
},"<")

timeLine2.to(".card-portafolio-3",{
    y:"-40vh",
    duration:35,
},"<")

timeLine2.to(".card-portafolio-4",{
    y:"-35vh",
    duration:35,
},"<")

timeLine2.to(".card-portafolio",{
    y:"-105vh",
    duration:35,
    delay:10
},">")


timeLine2.to(".gsap-2",{
    x:"-100vw",
    opacity:0,
    duration:35,
    delay:10
})

var timeLine3 = gsap.timeline({
    scrollTrigger:{
        trigger: '.be4tech',
        pin: ".gsap-3",
        markers: true,
        start: '100px bottom',
        end: 'bottom bottom',
        scrub: 5,
        delay: 2
    },
});

timeLine3.from(".gsap-3",{
    x:"150vw",
    opacity: 0,
    duration:25,
    // delay:2
},"<")

timeLine3.from(".card-portafolio-be4tech-2",{
    x:"-150vw",
    opacity: 0,
    duration:15,
    delay:4
},"<")

timeLine3.from(".card-portafolio-be4tech-1",{
    x:'-150vh',
    opacity:0,
    duration:20,
    delay:2
},"<")

timeLine3.to(".card-portafolio-be4tech",{
    y:"-10vw",
    duration:15,
    delay:4
},">")

timeLine3.to(".card-portafolio-be4tech-2",{
    x:"-150vw",
    opacity: 0,
    duration:15,
    delay:20
},">")

timeLine3.to(".card-portafolio-be4tech-1",{
    x:'-150vh',
    opacity:0,
    duration:20,
},"<")

timeLine3.to(".gsap-3",{
    x:"150vw",
    opacity: 0,
    duration:5,
    // delay:2
},">")

// timeLine3.to(".card-portafolio-be4tech-2",{
//     y:'-35vh',
//     duration:10,
//     delay:5
// },"<")

// timeLine3.to(".card-portafolio-be4tech-1",{
//     y:'-15vh',
//     duration:10,
//     delay:20
// },">")

// timeLine3.to(".card-portafolio-be4tech-2",{
//     y:'-10vh',
//     duration:10,
//     delay:5
// },"<")

// timeLine3.to(".card-portafolio-be4tech-1",{
//     y:'-80vh',
//     opacity:0,
//     duration:10,
//     delay:20
// },">")

// timeLine3.to(".card-portafolio-be4tech-2",{
//     y:'-85vh',
//     opacity:0,
//     duration:10,
//     delay:5
// },"<")

// timeLine3.to(".gsap-3",{
//     x:"100vw",
//     opacity:0,
//     duration:35,
//     delay:20
// },"<")

var timeLine4 = gsap.timeline({
    scrollTrigger:{
        trigger: '.irocket',
        pin: ".gsap-4",
        markers: false,
        start: '100px bottom',
        end: 'bottom bottom',
        scrub: 5,
        delay: 2
    },
});

timeLine4.from(".gsap-4",{
    x:"50vw",
    opacity:0,
    duration:10,
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
