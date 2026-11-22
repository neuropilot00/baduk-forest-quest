"use strict";
// Keep the image paths explicit for the versioned and offline asset manifests.
const MapPlaceAssets=[
  {sheet:"./map-places-forest.webp", arrivals:[
    "./place-forest-00.webp","./place-forest-01.webp","./place-forest-02.webp","./place-forest-03.webp",
    "./place-forest-04.webp","./place-forest-05.webp","./place-forest-06.webp","./place-forest-07.webp",
    "./place-forest-08.webp","./place-forest-09.webp","./place-forest-10.webp","./place-forest-11.webp",
    "./place-forest-12.webp","./place-forest-13.webp","./place-forest-14.webp","./place-forest-15.webp",
    "./place-forest-16.webp","./place-forest-17.webp","./place-forest-18.webp","./place-forest-19.webp"
  ]},
  {sheet:"./map-places-drowned.webp", arrivals:[
    "./place-drowned-20.webp","./place-drowned-21.webp","./place-drowned-22.webp","./place-drowned-23.webp",
    "./place-drowned-24.webp","./place-drowned-25.webp","./place-drowned-26.webp","./place-drowned-27.webp",
    "./place-drowned-28.webp","./place-drowned-29.webp","./place-drowned-30.webp","./place-drowned-31.webp",
    "./place-drowned-32.webp","./place-drowned-33.webp","./place-drowned-34.webp","./place-drowned-35.webp",
    "./place-drowned-36.webp","./place-drowned-37.webp","./place-drowned-38.webp","./place-drowned-39.webp"
  ]},
  {sheet:"./map-places-ember.webp", arrivals:[
    "./place-ember-40.webp","./place-ember-41.webp","./place-ember-42.webp","./place-ember-43.webp",
    "./place-ember-44.webp","./place-ember-45.webp","./place-ember-46.webp","./place-ember-47.webp",
    "./place-ember-48.webp","./place-ember-49.webp","./place-ember-50.webp","./place-ember-51.webp",
    "./place-ember-52.webp","./place-ember-53.webp","./place-ember-54.webp","./place-ember-55.webp",
    "./place-ember-56.webp","./place-ember-57.webp","./place-ember-58.webp","./place-ember-59.webp"
  ]},
  {sheet:"./map-places-frost.webp", arrivals:[
    "./place-frost-60.webp","./place-frost-61.webp","./place-frost-62.webp","./place-frost-63.webp",
    "./place-frost-64.webp","./place-frost-65.webp","./place-frost-66.webp","./place-frost-67.webp",
    "./place-frost-68.webp","./place-frost-69.webp","./place-frost-70.webp","./place-frost-71.webp",
    "./place-frost-72.webp","./place-frost-73.webp","./place-frost-74.webp","./place-frost-75.webp",
    "./place-frost-76.webp","./place-frost-77.webp","./place-frost-78.webp","./place-frost-79.webp"
  ]},
  {sheet:"./map-places-starwater.webp", arrivals:[
    "./place-starwater-80.webp","./place-starwater-81.webp","./place-starwater-82.webp","./place-starwater-83.webp",
    "./place-starwater-84.webp","./place-starwater-85.webp","./place-starwater-86.webp","./place-reed-sluice.webp",
    "./place-starwater-88.webp","./place-counterweight-bridge.webp","./place-starwater-90.webp","./place-starwater-91.webp",
    "./place-starwater-92.webp","./place-salt-garden.webp","./place-starwater-94.webp","./place-starwater-95.webp",
    "./place-starwater-96.webp","./place-starwater-97.webp","./place-starwater-98.webp","./place-starwater-99.webp"
  ],forks:["./place-starwater-west.webp","./place-starwater-east.webp"]},
  {sheet:"./map-places-observatory.webp", arrivals:[
    "./place-observatory-100.webp","./place-observatory-101.webp","./place-observatory-102.webp","./place-observatory-103.webp",
    "./place-observatory-104.webp","./place-observatory-105.webp","./place-observatory-106.webp","./place-observatory-107.webp",
    "./place-observatory-108.webp","./place-observatory-109.webp","./place-observatory-110.webp","./place-observatory-111.webp",
    "./place-observatory-112.webp","./place-observatory-113.webp","./place-observatory-114.webp","./place-observatory-115.webp",
    "./place-observatory-116.webp","./place-observatory-117.webp","./place-observatory-118.webp","./place-observatory-119.webp"
  ],forks:["./place-observatory-west.webp","./place-observatory-east.webp"]},
  {sheet:"./map-places-glass.webp", arrivals:[
    "./place-glass-120.webp","./place-glass-121.webp","./place-glass-122.webp","./place-glass-123.webp",
    "./place-glass-124.webp","./place-glass-125.webp","./place-glass-126.webp","./place-glass-127.webp",
    "./place-glass-128.webp","./place-glass-129.webp","./place-glass-130.webp","./place-glass-131.webp",
    "./place-glass-132.webp","./place-glass-133.webp","./place-glass-134.webp","./place-glass-135.webp",
    "./place-glass-136.webp","./place-glass-137.webp","./place-glass-138.webp","./place-glass-139.webp"
  ],forks:["./place-glass-west.webp","./place-glass-east.webp"]},
  {sheet:"./map-places-tidal.webp", arrivals:[
    "./place-tidal-140.webp","./place-tidal-141.webp","./place-tidal-142.webp","./place-tidal-143.webp",
    "./place-tidal-144.webp","./place-tidal-145.webp","./place-tidal-146.webp","./place-tidal-147.webp",
    "./place-tidal-148.webp","./place-tidal-149.webp","./place-tidal-150.webp","./place-tidal-151.webp",
    "./place-tidal-152.webp","./place-tidal-153.webp","./place-tidal-154.webp","./place-tidal-155.webp",
    "./place-tidal-156.webp","./place-tidal-157.webp","./place-tidal-158.webp","./place-tidal-159.webp"
  ],forks:["./place-tidal-west.webp","./place-tidal-east.webp"]},
  {sheet:"./map-places-backward-mill.webp", arrivals:[
    "./place-backward-mill-160.webp","./place-backward-mill-161.webp","./place-backward-mill-162.webp","./place-backward-mill-163.webp",
    "./place-backward-mill-164.webp","./place-backward-mill-165.webp","./place-backward-mill-166.webp","./place-backward-mill-167.webp",
    "./place-backward-mill-168.webp","./place-backward-mill-169.webp","./place-backward-mill-170.webp","./place-backward-mill-171.webp",
    "./place-backward-mill-172.webp","./place-backward-mill-173.webp","./place-backward-mill-174.webp","./place-backward-mill-175.webp",
    "./place-backward-mill-176.webp","./place-backward-mill-177.webp","./place-backward-mill-178.webp","./place-backward-mill-179.webp"
  ],forks:["./place-backward-mill-west.webp","./place-backward-mill-east.webp"]},
  {sheet:"./map-places-sliding-dike.webp", arrivals:[
    "./place-sliding-dike-180.webp","./place-sliding-dike-181.webp","./place-sliding-dike-182.webp","./place-sliding-dike-183.webp",
    "./place-sliding-dike-184.webp","./place-sliding-dike-185.webp","./place-sliding-dike-186.webp","./place-sliding-dike-187.webp",
    "./place-sliding-dike-188.webp","./place-sliding-dike-189.webp","./place-sliding-dike-190.webp","./place-sliding-dike-191.webp",
    "./place-sliding-dike-192.webp","./place-sliding-dike-193.webp","./place-sliding-dike-194.webp","./place-sliding-dike-195.webp",
    "./place-sliding-dike-196.webp","./place-sliding-dike-197.webp","./place-sliding-dike-198.webp","./place-sliding-dike-199.webp"
  ],forks:["./place-sliding-dike-west.webp","./place-sliding-dike-east.webp"]},
  {sheet:"./map-places-night-lock.webp", arrivals:[
    "./place-night-lock-200.webp","./place-night-lock-201.webp","./place-night-lock-202.webp","./place-night-lock-203.webp",
    "./place-night-lock-204.webp","./place-night-lock-205.webp","./place-night-lock-206.webp","./place-night-lock-207.webp",
    "./place-night-lock-208.webp","./place-night-lock-209.webp","./place-night-lock-210.webp","./place-night-lock-211.webp",
    "./place-night-lock-212.webp","./place-night-lock-213.webp","./place-night-lock-214.webp","./place-night-lock-215.webp",
    "./place-night-lock-216.webp","./place-night-lock-217.webp","./place-night-lock-218.webp","./place-night-lock-219.webp"
  ],forks:["./place-night-lock-west.webp","./place-night-lock-east.webp"]},
  {sheet:"./map-places-boot-post.webp", arrivals:[
    "./place-boot-post-220.webp","./place-boot-post-221.webp","./place-boot-post-222.webp","./place-boot-post-223.webp",
    "./place-boot-post-224.webp","./place-boot-post-225.webp","./place-boot-post-226.webp","./place-boot-post-227.webp",
    "./place-boot-post-228.webp","./place-boot-post-229.webp","./place-boot-post-230.webp","./place-boot-post-231.webp",
    "./place-boot-post-232.webp","./place-boot-post-233.webp","./place-boot-post-234.webp","./place-boot-post-235.webp",
    "./place-boot-post-236.webp","./place-boot-post-237.webp","./place-boot-post-238.webp","./place-boot-post-239.webp"
  ],forks:["./place-boot-post-west.webp","./place-boot-post-east.webp"]},
  {sheet:"./map-places-twin-gorge.webp", arrivals:[
    "./place-twin-gorge-240.webp","./place-twin-gorge-241.webp","./place-twin-gorge-242.webp","./place-twin-gorge-243.webp",
    "./place-twin-gorge-244.webp","./place-twin-gorge-245.webp","./place-twin-gorge-246.webp","./place-twin-gorge-247.webp",
    "./place-twin-gorge-248.webp","./place-twin-gorge-249.webp","./place-twin-gorge-250.webp","./place-twin-gorge-251.webp",
    "./place-twin-gorge-252.webp","./place-twin-gorge-253.webp","./place-twin-gorge-254.webp","./place-twin-gorge-255.webp",
    "./place-twin-gorge-256.webp","./place-twin-gorge-257.webp","./place-twin-gorge-258.webp","./place-twin-gorge-259.webp"
  ],forks:["./place-twin-gorge-west.webp","./place-twin-gorge-east.webp"]},
  {sheet:"./map-places-ink-fields.webp", arrivals:[
    "./place-ink-fields-260.webp","./place-ink-fields-261.webp","./place-ink-fields-262.webp","./place-ink-fields-263.webp",
    "./place-ink-fields-264.webp","./place-ink-fields-265.webp","./place-ink-fields-266.webp","./place-ink-fields-267.webp",
    "./place-ink-fields-268.webp","./place-ink-fields-269.webp","./place-ink-fields-270.webp","./place-ink-fields-271.webp",
    "./place-ink-fields-272.webp","./place-ink-fields-273.webp","./place-ink-fields-274.webp","./place-ink-fields-275.webp",
    "./place-ink-fields-276.webp","./place-ink-fields-277.webp","./place-ink-fields-278.webp","./place-ink-fields-279.webp"
  ],forks:["./place-ink-fields-west.webp","./place-ink-fields-east.webp"]},
  {sheet:"./map-places-weighing-reach.webp", arrivals:[
    "./place-weighing-reach-280.webp","./place-weighing-reach-281.webp","./place-weighing-reach-282.webp","./place-weighing-reach-283.webp",
    "./place-weighing-reach-284.webp","./place-weighing-reach-285.webp","./place-weighing-reach-286.webp","./place-weighing-reach-287.webp",
    "./place-weighing-reach-288.webp","./place-weighing-reach-289.webp","./place-weighing-reach-290.webp","./place-weighing-reach-291.webp",
    "./place-weighing-reach-292.webp","./place-weighing-reach-293.webp","./place-weighing-reach-294.webp","./place-weighing-reach-295.webp",
    "./place-weighing-reach-296.webp","./place-weighing-reach-297.webp","./place-weighing-reach-298.webp","./place-weighing-reach-299.webp"
  ],forks:["./place-weighing-reach-west.webp","./place-weighing-reach-east.webp"]},
  {sheet:"./map-places-silent-lock.webp", arrivals:[
    "./place-silent-lock-300.webp","./place-silent-lock-301.webp","./place-silent-lock-302.webp","./place-silent-lock-303.webp",
    "./place-silent-lock-304.webp","./place-silent-lock-305.webp","./place-silent-lock-306.webp","./place-silent-lock-307.webp",
    "./place-silent-lock-308.webp","./place-silent-lock-309.webp","./place-silent-lock-310.webp","./place-silent-lock-311.webp",
    "./place-silent-lock-312.webp","./place-silent-lock-313.webp","./place-silent-lock-314.webp","./place-silent-lock-315.webp",
    "./place-silent-lock-316.webp","./place-silent-lock-317.webp","./place-silent-lock-318.webp","./place-silent-lock-319.webp"
  ],forks:["./place-silent-lock-west.webp","./place-silent-lock-east.webp"]},
];
