# yal ![Codeship Status for sateffen/yal](https://codeship.com/projects/68299760-524c-0133-0800-3289b2b41ce8/status?branch=master)#

yal is yet another (not needed) library. 

## What is yal exactly ##

yal is yet another library, that tries to solve a very specific problem: data-flow.

KnockoutJS users know about the insane possiblities for data-flow with observables and
computeds, which help to create huge, but simple data-flows.

yal is a little helper that enables you to use the power of this observables and computeds
outside of KnockoutJS, so you can use it in every environment you need it.

There is no overhead with dependencies, there is no overhead with not needed things, there
is just this little helper.

## Will there be more features in this lib? ##

Actually I don't think so. The main purpose is the observable <-> computed thing, nothing
more. But the structure is so simple, that I think about some "optional extensions" that
can be patched to the library, so it'll get capable of data-binding like KnockoutJS, or
creating type-safe observables.

## Can I use this in production? ##

Actually, while reading this, you might have downloaded the source-code already, so how can
I prevent you from using the code?

Feel free to use yal in every project you like. If there are bugs, just report them back,
so I can fix them for everyone, or you provide a pull request with a solution.

The code is tested by unittests as encapsuled units executed by codeship, so I think the
quality should be good enougth for production code. But feel free to provide more tests to
even cover edges, that I didn't thought of.

In future I plan on building some "integration tests", that test everything together, but
I need some time for that.

## Where is the documentation? ##

You'll find the complete documentation in the wiki.

## License? ##

MIT (see LICENSE file).