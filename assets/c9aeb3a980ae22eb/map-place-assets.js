"use strict";
// Keep the image paths explicit for the versioned and offline asset manifests.
const MapPlaceAssets=[
  {sheet:"../eaecd090510d7805/map-places-forest.webp", arrivals:[
    "../eaecd090510d7805/place-forest-00.webp","../eaecd090510d7805/place-forest-01.webp","../eaecd090510d7805/place-forest-02.webp","../eaecd090510d7805/place-forest-03.webp",
    "../eaecd090510d7805/place-forest-04.webp","../eaecd090510d7805/place-forest-05.webp","../eaecd090510d7805/place-forest-06.webp","../eaecd090510d7805/place-forest-07.webp",
    "../eaecd090510d7805/place-forest-08.webp","../eaecd090510d7805/place-forest-09.webp","../eaecd090510d7805/place-forest-10.webp","../eaecd090510d7805/place-forest-11.webp",
    "../eaecd090510d7805/place-forest-12.webp","../eaecd090510d7805/place-forest-13.webp","../eaecd090510d7805/place-forest-14.webp","../eaecd090510d7805/place-forest-15.webp",
    "../eaecd090510d7805/place-forest-16.webp","../eaecd090510d7805/place-forest-17.webp","../eaecd090510d7805/place-forest-18.webp","../eaecd090510d7805/place-forest-19.webp"
  ]},
  {sheet:"../eaecd090510d7805/map-places-drowned.webp", arrivals:[
    "../eaecd090510d7805/place-drowned-20.webp","../eaecd090510d7805/place-drowned-21.webp","../eaecd090510d7805/place-drowned-22.webp","../eaecd090510d7805/place-drowned-23.webp",
    "../eaecd090510d7805/place-drowned-24.webp","../eaecd090510d7805/place-drowned-25.webp","../eaecd090510d7805/place-drowned-26.webp","../eaecd090510d7805/place-drowned-27.webp",
    "../eaecd090510d7805/place-drowned-28.webp","../eaecd090510d7805/place-drowned-29.webp","../eaecd090510d7805/place-drowned-30.webp","../eaecd090510d7805/place-drowned-31.webp",
    "../eaecd090510d7805/place-drowned-32.webp","../eaecd090510d7805/place-drowned-33.webp","../eaecd090510d7805/place-drowned-34.webp","../eaecd090510d7805/place-drowned-35.webp",
    "../eaecd090510d7805/place-drowned-36.webp","../eaecd090510d7805/place-drowned-37.webp","../eaecd090510d7805/place-drowned-38.webp","../eaecd090510d7805/place-drowned-39.webp"
  ]},
  {sheet:"../eaecd090510d7805/map-places-ember.webp", arrivals:[
    "../eaecd090510d7805/place-ember-40.webp","../eaecd090510d7805/place-ember-41.webp","../eaecd090510d7805/place-ember-42.webp","../eaecd090510d7805/place-ember-43.webp",
    "../eaecd090510d7805/place-ember-44.webp","../eaecd090510d7805/place-ember-45.webp","../eaecd090510d7805/place-ember-46.webp","../eaecd090510d7805/place-ember-47.webp",
    "../eaecd090510d7805/place-ember-48.webp","../eaecd090510d7805/place-ember-49.webp","../eaecd090510d7805/place-ember-50.webp","../eaecd090510d7805/place-ember-51.webp",
    "../eaecd090510d7805/place-ember-52.webp","../eaecd090510d7805/place-ember-53.webp","../eaecd090510d7805/place-ember-54.webp","../eaecd090510d7805/place-ember-55.webp",
    "../eaecd090510d7805/place-ember-56.webp","../eaecd090510d7805/place-ember-57.webp","../eaecd090510d7805/place-ember-58.webp","../eaecd090510d7805/place-ember-59.webp"
  ]},
  {sheet:"../eaecd090510d7805/map-places-frost.webp", arrivals:[
    "../eaecd090510d7805/place-frost-60.webp","../eaecd090510d7805/place-frost-61.webp","../eaecd090510d7805/place-frost-62.webp","../eaecd090510d7805/place-frost-63.webp",
    "../eaecd090510d7805/place-frost-64.webp","../eaecd090510d7805/place-frost-65.webp","../eaecd090510d7805/place-frost-66.webp","../eaecd090510d7805/place-frost-67.webp",
    "../eaecd090510d7805/place-frost-68.webp","../eaecd090510d7805/place-frost-69.webp","../eaecd090510d7805/place-frost-70.webp","../eaecd090510d7805/place-frost-71.webp",
    "../eaecd090510d7805/place-frost-72.webp","../eaecd090510d7805/place-frost-73.webp","../eaecd090510d7805/place-frost-74.webp","../eaecd090510d7805/place-frost-75.webp",
    "../eaecd090510d7805/place-frost-76.webp","../eaecd090510d7805/place-frost-77.webp","../eaecd090510d7805/place-frost-78.webp","../eaecd090510d7805/place-frost-79.webp"
  ]},
  {sheet:"../eaecd090510d7805/map-places-starwater.webp", arrivals:[
    "../eaecd090510d7805/place-starwater-80.webp","../eaecd090510d7805/place-starwater-81.webp","../eaecd090510d7805/place-starwater-82.webp","../eaecd090510d7805/place-starwater-83.webp",
    "../eaecd090510d7805/place-starwater-84.webp","../eaecd090510d7805/place-starwater-85.webp","../eaecd090510d7805/place-starwater-86.webp","../eaecd090510d7805/place-reed-sluice.webp",
    "../eaecd090510d7805/place-starwater-88.webp","../eaecd090510d7805/place-counterweight-bridge.webp","../eaecd090510d7805/place-starwater-90.webp","../eaecd090510d7805/place-starwater-91.webp",
    "../eaecd090510d7805/place-starwater-92.webp","../eaecd090510d7805/place-salt-garden.webp","../eaecd090510d7805/place-starwater-94.webp","../eaecd090510d7805/place-starwater-95.webp",
    "../eaecd090510d7805/place-starwater-96.webp","../eaecd090510d7805/place-starwater-97.webp","../eaecd090510d7805/place-starwater-98.webp","../eaecd090510d7805/place-starwater-99.webp"
  ],forks:["../eaecd090510d7805/place-starwater-west.webp","../eaecd090510d7805/place-starwater-east.webp"]},
  {sheet:"../eaecd090510d7805/map-places-observatory.webp", arrivals:[
    "../eaecd090510d7805/place-observatory-100.webp","../eaecd090510d7805/place-observatory-101.webp","../eaecd090510d7805/place-observatory-102.webp","../eaecd090510d7805/place-observatory-103.webp",
    "../eaecd090510d7805/place-observatory-104.webp","../eaecd090510d7805/place-observatory-105.webp","../eaecd090510d7805/place-observatory-106.webp","../eaecd090510d7805/place-observatory-107.webp",
    "../eaecd090510d7805/place-observatory-108.webp","../eaecd090510d7805/place-observatory-109.webp","../eaecd090510d7805/place-observatory-110.webp","../eaecd090510d7805/place-observatory-111.webp",
    "../eaecd090510d7805/place-observatory-112.webp","../eaecd090510d7805/place-observatory-113.webp","../eaecd090510d7805/place-observatory-114.webp","../eaecd090510d7805/place-observatory-115.webp",
    "../eaecd090510d7805/place-observatory-116.webp","../eaecd090510d7805/place-observatory-117.webp","../eaecd090510d7805/place-observatory-118.webp","../eaecd090510d7805/place-observatory-119.webp"
  ],forks:["../eaecd090510d7805/place-observatory-west.webp","../eaecd090510d7805/place-observatory-east.webp"]},
  {sheet:"../eaecd090510d7805/map-places-glass.webp", arrivals:[
    "../eaecd090510d7805/place-glass-120.webp","../eaecd090510d7805/place-glass-121.webp","../eaecd090510d7805/place-glass-122.webp","../eaecd090510d7805/place-glass-123.webp",
    "../eaecd090510d7805/place-glass-124.webp","../eaecd090510d7805/place-glass-125.webp","../eaecd090510d7805/place-glass-126.webp","../eaecd090510d7805/place-glass-127.webp",
    "../eaecd090510d7805/place-glass-128.webp","../eaecd090510d7805/place-glass-129.webp","../eaecd090510d7805/place-glass-130.webp","../eaecd090510d7805/place-glass-131.webp",
    "../eaecd090510d7805/place-glass-132.webp","../eaecd090510d7805/place-glass-133.webp","../eaecd090510d7805/place-glass-134.webp","../eaecd090510d7805/place-glass-135.webp",
    "../eaecd090510d7805/place-glass-136.webp","../eaecd090510d7805/place-glass-137.webp","../eaecd090510d7805/place-glass-138.webp","../eaecd090510d7805/place-glass-139.webp"
  ],forks:["../eaecd090510d7805/place-glass-west.webp","../eaecd090510d7805/place-glass-east.webp"]},
  {sheet:"../eaecd090510d7805/map-places-tidal.webp", arrivals:[
    "../eaecd090510d7805/place-tidal-140.webp","../eaecd090510d7805/place-tidal-141.webp","../eaecd090510d7805/place-tidal-142.webp","../eaecd090510d7805/place-tidal-143.webp",
    "../eaecd090510d7805/place-tidal-144.webp","../eaecd090510d7805/place-tidal-145.webp","../eaecd090510d7805/place-tidal-146.webp","../eaecd090510d7805/place-tidal-147.webp",
    "../eaecd090510d7805/place-tidal-148.webp","../eaecd090510d7805/place-tidal-149.webp","../eaecd090510d7805/place-tidal-150.webp","../eaecd090510d7805/place-tidal-151.webp",
    "../eaecd090510d7805/place-tidal-152.webp","../eaecd090510d7805/place-tidal-153.webp","../eaecd090510d7805/place-tidal-154.webp","../eaecd090510d7805/place-tidal-155.webp",
    "../eaecd090510d7805/place-tidal-156.webp","../eaecd090510d7805/place-tidal-157.webp","../eaecd090510d7805/place-tidal-158.webp","../eaecd090510d7805/place-tidal-159.webp"
  ],forks:["../eaecd090510d7805/place-tidal-west.webp","../eaecd090510d7805/place-tidal-east.webp"]},
  {sheet:"../eaecd090510d7805/map-places-backward-mill.webp", arrivals:[
    "../eaecd090510d7805/place-backward-mill-160.webp","../eaecd090510d7805/place-backward-mill-161.webp","../eaecd090510d7805/place-backward-mill-162.webp","../eaecd090510d7805/place-backward-mill-163.webp",
    "../eaecd090510d7805/place-backward-mill-164.webp","../eaecd090510d7805/place-backward-mill-165.webp","../eaecd090510d7805/place-backward-mill-166.webp","../eaecd090510d7805/place-backward-mill-167.webp",
    "../eaecd090510d7805/place-backward-mill-168.webp","../eaecd090510d7805/place-backward-mill-169.webp","../eaecd090510d7805/place-backward-mill-170.webp","../eaecd090510d7805/place-backward-mill-171.webp",
    "../eaecd090510d7805/place-backward-mill-172.webp","../eaecd090510d7805/place-backward-mill-173.webp","../eaecd090510d7805/place-backward-mill-174.webp","../eaecd090510d7805/place-backward-mill-175.webp",
    "../eaecd090510d7805/place-backward-mill-176.webp","../eaecd090510d7805/place-backward-mill-177.webp","../eaecd090510d7805/place-backward-mill-178.webp","../eaecd090510d7805/place-backward-mill-179.webp"
  ],forks:["../eaecd090510d7805/place-backward-mill-west.webp","../eaecd090510d7805/place-backward-mill-east.webp"]},
  {sheet:"../eaecd090510d7805/map-places-sliding-dike.webp", arrivals:[
    "../eaecd090510d7805/place-sliding-dike-180.webp","../eaecd090510d7805/place-sliding-dike-181.webp","../eaecd090510d7805/place-sliding-dike-182.webp","../eaecd090510d7805/place-sliding-dike-183.webp",
    "../eaecd090510d7805/place-sliding-dike-184.webp","../eaecd090510d7805/place-sliding-dike-185.webp","../eaecd090510d7805/place-sliding-dike-186.webp","../eaecd090510d7805/place-sliding-dike-187.webp",
    "../eaecd090510d7805/place-sliding-dike-188.webp","../eaecd090510d7805/place-sliding-dike-189.webp","../eaecd090510d7805/place-sliding-dike-190.webp","../eaecd090510d7805/place-sliding-dike-191.webp",
    "../eaecd090510d7805/place-sliding-dike-192.webp","../eaecd090510d7805/place-sliding-dike-193.webp","../eaecd090510d7805/place-sliding-dike-194.webp","../eaecd090510d7805/place-sliding-dike-195.webp",
    "../eaecd090510d7805/place-sliding-dike-196.webp","../eaecd090510d7805/place-sliding-dike-197.webp","../eaecd090510d7805/place-sliding-dike-198.webp","../eaecd090510d7805/place-sliding-dike-199.webp"
  ],forks:["../eaecd090510d7805/place-sliding-dike-west.webp","../eaecd090510d7805/place-sliding-dike-east.webp"]},
  {sheet:"../eaecd090510d7805/map-places-night-lock.webp", arrivals:[
    "../eaecd090510d7805/place-night-lock-200.webp","../eaecd090510d7805/place-night-lock-201.webp","../eaecd090510d7805/place-night-lock-202.webp","../eaecd090510d7805/place-night-lock-203.webp",
    "../eaecd090510d7805/place-night-lock-204.webp","../eaecd090510d7805/place-night-lock-205.webp","../eaecd090510d7805/place-night-lock-206.webp","../eaecd090510d7805/place-night-lock-207.webp",
    "../eaecd090510d7805/place-night-lock-208.webp","../eaecd090510d7805/place-night-lock-209.webp","../eaecd090510d7805/place-night-lock-210.webp","../eaecd090510d7805/place-night-lock-211.webp",
    "../eaecd090510d7805/place-night-lock-212.webp","../eaecd090510d7805/place-night-lock-213.webp","../eaecd090510d7805/place-night-lock-214.webp","../eaecd090510d7805/place-night-lock-215.webp",
    "../eaecd090510d7805/place-night-lock-216.webp","../eaecd090510d7805/place-night-lock-217.webp","../eaecd090510d7805/place-night-lock-218.webp","../eaecd090510d7805/place-night-lock-219.webp"
  ],forks:["../eaecd090510d7805/place-night-lock-west.webp","../eaecd090510d7805/place-night-lock-east.webp"]},
  {sheet:"../eaecd090510d7805/map-places-boot-post.webp", arrivals:[
    "../eaecd090510d7805/place-boot-post-220.webp","../eaecd090510d7805/place-boot-post-221.webp","../eaecd090510d7805/place-boot-post-222.webp","../eaecd090510d7805/place-boot-post-223.webp",
    "../eaecd090510d7805/place-boot-post-224.webp","../eaecd090510d7805/place-boot-post-225.webp","../eaecd090510d7805/place-boot-post-226.webp","../eaecd090510d7805/place-boot-post-227.webp",
    "../eaecd090510d7805/place-boot-post-228.webp","../eaecd090510d7805/place-boot-post-229.webp","../eaecd090510d7805/place-boot-post-230.webp","../eaecd090510d7805/place-boot-post-231.webp",
    "../eaecd090510d7805/place-boot-post-232.webp","../eaecd090510d7805/place-boot-post-233.webp","../eaecd090510d7805/place-boot-post-234.webp","../eaecd090510d7805/place-boot-post-235.webp",
    "../eaecd090510d7805/place-boot-post-236.webp","../eaecd090510d7805/place-boot-post-237.webp","../eaecd090510d7805/place-boot-post-238.webp","../eaecd090510d7805/place-boot-post-239.webp"
  ],forks:["../eaecd090510d7805/place-boot-post-west.webp","../eaecd090510d7805/place-boot-post-east.webp"]},
  {sheet:"../eaecd090510d7805/map-places-twin-gorge.webp", arrivals:[
    "../eaecd090510d7805/place-twin-gorge-240.webp","../eaecd090510d7805/place-twin-gorge-241.webp","../eaecd090510d7805/place-twin-gorge-242.webp","../eaecd090510d7805/place-twin-gorge-243.webp",
    "../eaecd090510d7805/place-twin-gorge-244.webp","../eaecd090510d7805/place-twin-gorge-245.webp","../eaecd090510d7805/place-twin-gorge-246.webp","../eaecd090510d7805/place-twin-gorge-247.webp",
    "../eaecd090510d7805/place-twin-gorge-248.webp","../eaecd090510d7805/place-twin-gorge-249.webp","../eaecd090510d7805/place-twin-gorge-250.webp","../eaecd090510d7805/place-twin-gorge-251.webp",
    "../eaecd090510d7805/place-twin-gorge-252.webp","../eaecd090510d7805/place-twin-gorge-253.webp","../eaecd090510d7805/place-twin-gorge-254.webp","../eaecd090510d7805/place-twin-gorge-255.webp",
    "../eaecd090510d7805/place-twin-gorge-256.webp","../eaecd090510d7805/place-twin-gorge-257.webp","../eaecd090510d7805/place-twin-gorge-258.webp","../eaecd090510d7805/place-twin-gorge-259.webp"
  ],forks:["../eaecd090510d7805/place-twin-gorge-west.webp","../eaecd090510d7805/place-twin-gorge-east.webp"]},
  {sheet:"../eaecd090510d7805/map-places-ink-fields.webp", arrivals:[
    "../eaecd090510d7805/place-ink-fields-260.webp","../eaecd090510d7805/place-ink-fields-261.webp","../eaecd090510d7805/place-ink-fields-262.webp","../eaecd090510d7805/place-ink-fields-263.webp",
    "../eaecd090510d7805/place-ink-fields-264.webp","../eaecd090510d7805/place-ink-fields-265.webp","../eaecd090510d7805/place-ink-fields-266.webp","../eaecd090510d7805/place-ink-fields-267.webp",
    "../eaecd090510d7805/place-ink-fields-268.webp","../eaecd090510d7805/place-ink-fields-269.webp","../eaecd090510d7805/place-ink-fields-270.webp","../eaecd090510d7805/place-ink-fields-271.webp",
    "../eaecd090510d7805/place-ink-fields-272.webp","../eaecd090510d7805/place-ink-fields-273.webp","../eaecd090510d7805/place-ink-fields-274.webp","../eaecd090510d7805/place-ink-fields-275.webp",
    "../eaecd090510d7805/place-ink-fields-276.webp","../eaecd090510d7805/place-ink-fields-277.webp","../eaecd090510d7805/place-ink-fields-278.webp","../eaecd090510d7805/place-ink-fields-279.webp"
  ],forks:["../eaecd090510d7805/place-ink-fields-west.webp","../eaecd090510d7805/place-ink-fields-east.webp"]},
  {sheet:"../eaecd090510d7805/map-places-weighing-reach.webp", arrivals:[
    "../eaecd090510d7805/place-weighing-reach-280.webp","../eaecd090510d7805/place-weighing-reach-281.webp","../eaecd090510d7805/place-weighing-reach-282.webp","../eaecd090510d7805/place-weighing-reach-283.webp",
    "../eaecd090510d7805/place-weighing-reach-284.webp","../eaecd090510d7805/place-weighing-reach-285.webp","../eaecd090510d7805/place-weighing-reach-286.webp","../eaecd090510d7805/place-weighing-reach-287.webp",
    "../eaecd090510d7805/place-weighing-reach-288.webp","../eaecd090510d7805/place-weighing-reach-289.webp","../eaecd090510d7805/place-weighing-reach-290.webp","../eaecd090510d7805/place-weighing-reach-291.webp",
    "../eaecd090510d7805/place-weighing-reach-292.webp","../eaecd090510d7805/place-weighing-reach-293.webp","../eaecd090510d7805/place-weighing-reach-294.webp","../eaecd090510d7805/place-weighing-reach-295.webp",
    "../eaecd090510d7805/place-weighing-reach-296.webp","../eaecd090510d7805/place-weighing-reach-297.webp","../eaecd090510d7805/place-weighing-reach-298.webp","../eaecd090510d7805/place-weighing-reach-299.webp"
  ],forks:["../eaecd090510d7805/place-weighing-reach-west.webp","../eaecd090510d7805/place-weighing-reach-east.webp"]},
  {sheet:"../eaecd090510d7805/map-places-silent-lock.webp", arrivals:[
    "../eaecd090510d7805/place-silent-lock-300.webp","../eaecd090510d7805/place-silent-lock-301.webp","../eaecd090510d7805/place-silent-lock-302.webp","../eaecd090510d7805/place-silent-lock-303.webp",
    "../eaecd090510d7805/place-silent-lock-304.webp","../eaecd090510d7805/place-silent-lock-305.webp","../eaecd090510d7805/place-silent-lock-306.webp","../eaecd090510d7805/place-silent-lock-307.webp",
    "../eaecd090510d7805/place-silent-lock-308.webp","../eaecd090510d7805/place-silent-lock-309.webp","../eaecd090510d7805/place-silent-lock-310.webp","../eaecd090510d7805/place-silent-lock-311.webp",
    "../eaecd090510d7805/place-silent-lock-312.webp","../eaecd090510d7805/place-silent-lock-313.webp","../eaecd090510d7805/place-silent-lock-314.webp","../eaecd090510d7805/place-silent-lock-315.webp",
    "../eaecd090510d7805/place-silent-lock-316.webp","../eaecd090510d7805/place-silent-lock-317.webp","../eaecd090510d7805/place-silent-lock-318.webp","../eaecd090510d7805/place-silent-lock-319.webp"
  ],forks:["../eaecd090510d7805/place-silent-lock-west.webp","../eaecd090510d7805/place-silent-lock-east.webp"]},
];
