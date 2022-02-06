gsap.registerPlugin(ScrollTrigger);

if (screen.width > 620) {

  
    
    var tlBanner = gsap.timeline({
        scrollTrigger:{
            trigger: '.banner',
            markers: false,
            start: 'top top', 
            end: 'bottom top',
            scrub: 5,
            pin: true
        }
    });

    tlBanner.to(".title-banner",{
        x:'100vw',
        opacity:0,
        duration:3,
    })

    tlBanner.to(".model-viewer",{
        x:'50vw',
        duration:1,
    },"<")

    tlBanner.to(".about-me",{
        x:'70vw',
        delay:0.4,
        duration:3,
    },"<")

    tlBanner.to(".banner",{
        opacity:'0',
        delay:2,
        duration:2,
    },"<")

    var tlSubBanner = gsap.timeline({
        scrollTrigger:{
            trigger: '.portafolio',
            markers: false,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 25,
            pin: false
        }
    });

    tlSubBanner.from(".sub-banner",{
        opacity:'0',
        duration:0.1,
    },"<")

    tlSubBanner.to(".projects-title-1",{
        // opacity:'0',
        x:'100vw',
        duration:1,
    },"<")


    tlSubBanner.to(".projects-title-2",{
        // opacity:'0',
        x:'-100vw',
        duration:1,
    },"<")


    tlSubBanner.to(".projects-title-3",{
        // opacity:'0',
        x:'100vw',
        duration:1,
    },"<")


    tlSubBanner.to(".projects-title-4",{
        // opacity:'0',
        x:'-100vw',
        duration:1,
    },"<")

    var tlBe4care = gsap.timeline({
        scrollTrigger:{
            trigger: '.be4care',
            markers: false,
            start: 'top bottom',
            end: 'bottom bottom',
            scrub: 10,
            pin: false
        }
    });

    tlBe4care.from(".gsap-2",{
        opacity:'0',
        x:'-50vw',
        duration:1,
    },"<")

    tlBe4care.from(".card-portafolio-be4care-1",{
        opacity:'0',
        x:'60vw',
        duration:1,
    },">")

    tlBe4care.from(".card-portafolio-be4care-2",{
        opacity:'0',
        x:'60vw',
        duration:1,
    },"<")

    tlBe4care.from(".card-portafolio-be4care-3",{
        opacity:'0',
        x:'60vw',
        duration:1,
    },"<")

    tlBe4care.from(".card-portafolio-be4care-4",{
        opacity:'0',
        x:'60vw',
        duration:1,
    },"<")



    var tlBe4tech = gsap.timeline({
        scrollTrigger:{
            trigger: '.be4tech',
            markers: false,
            start: 'top bottom',
            end: 'bottom bottom',
            scrub: 10,
            pin: false
        }
    });

    tlBe4tech.from(".gsap-3",{
        opacity:'0',
        x:'-50vw',
        duration:1,
    },"<")

    tlBe4tech.from(".card-portafolio-be4tech-1",{
        opacity:'0',
        x:'60vw',
        duration:2,
    },">")

    tlBe4tech.from(".card-portafolio-be4tech-2",{
        opacity:'0',
        x:'60vw',
        duration:2,
    },"<")




    var tlIrocket = gsap.timeline({
        scrollTrigger:{
            trigger: '.irocket',
            markers: false,
            start: 'top bottom',
            end: 'bottom bottom',
            scrub: 10,
            pin: false
        }
    });

    tlIrocket.from(".gsap-4",{
        opacity:'0',
        x:'-50vw',
        duration:1,
    },"<")

    tlIrocket.from(".card-portafolio-irocket-1",{
        opacity:'0',
        x:'60vw',
        duration:2,
    },">")

    tlIrocket.from(".card-portafolio-irocket-2",{
        opacity:'0',
        x:'60vw',
        duration:2,
    },"<")


    var tlQrAccess = gsap.timeline({
        scrollTrigger:{
            trigger: '.qr-access',
            markers: false,
            start: 'top bottom',
            end: 'bottom bottom',
            scrub: 10,
            pin: false
        }
    });

    tlQrAccess.from(".gsap-5",{
        opacity:'0',
        x:'-50vw',
        duration:1,
    },"<")

    tlQrAccess.from(".card-portafolio-qr-access-1",{
        opacity:'0',
        x:'60vh',
        duration:2,
    },">")

    var tlContact = gsap.timeline({
        scrollTrigger:{
            trigger: '.contact',
            markers: false,
            start: 'top bottom',
            end: 'bottom bottom',
            scrub: 5,
            pin: false
        }
    });

    tlContact.from(".contact-title-1",{
        opacity:'0',
        x:'-100vw',
        duration:2,
        delay:0.5
    },"<")
    tlContact.from(".contact-title-2",{
        opacity:'0',
        x:'-100vw',
        duration:2.2,
    },"<")
    tlContact.from(".aaron",{
        opacity:'0',
        x:'50vw',
        duration:1.2,
    },">")

    tlContact.from(".footer-contact",{
        opacity:'0',
        x:'-100vw',
        duration:1.2,
    },">")
}

