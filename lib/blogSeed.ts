import type { Post } from './types';

// Starter articles, added once when the blog is first set up. Edit or delete them in Admin → Blog.
const author = 'Home Staff Services Team';
const post = (p: Omit<Post, 'status' | 'author' | 'createdAt' | 'updatedAt'>): Post => ({ ...p, status: 'published', author, createdAt: p.publishedAt, updatedAt: p.publishedAt });

export const starterPosts: Post[] = [
  post({
    id: 'starter-hiring-checklist',
    slug: 'how-to-hire-reliable-domestic-staff-in-pakistan',
    title: 'How to Hire Reliable Domestic Staff in Pakistan: A Practical Checklist',
    excerpt: 'A step-by-step checklist for hiring a maid, cook, driver or carer — from writing down your needs to agreeing clear terms on day one.',
    cover: '/images/stock/hero.webp',
    seoTitle: 'How to Hire Reliable Domestic Staff in Pakistan (Checklist)',
    seoDescription: 'A practical checklist for Pakistani households hiring a maid, cook, driver, nanny or carer: define the role, check references, agree pay and duties.',
    publishedAt: '2026-10-20T09:00:00.000Z',
    body: `Bringing someone into your home is a big decision. Whether you need a housekeeper, a cook, a driver or a carer for an elderly parent, a little preparation makes the search faster and the working relationship smoother for everyone.

## 1. Write down exactly what you need

Before you speak to anyone, list the work you expect. Be specific:

- **Duties:** cleaning, laundry, cooking, school runs, childcare, patient care
- **Hours:** start and finish times, days off, and any evening or weekend work
- **Live-in or live-out:** whether you can offer accommodation and meals
- **Skills:** for example, cooking Pakistani and continental food, or a valid driving licence

A clear list helps you compare candidates fairly and avoids misunderstandings later.

## 2. Check identity and references

Ask to see the candidate's CNIC and keep a copy for your records. Speak directly with previous employers where possible and ask simple, practical questions:

- How long did they work for you, and why did they leave?
- Were they punctual and honest?
- Would you hire them again?

## 3. Meet in person and try a short trial

An interview at home shows you how someone communicates and whether they are comfortable with your household. Many families agree a short paid trial period so both sides can be sure the arrangement works.

## 4. Agree pay and terms clearly

Discuss the monthly salary, payment date, weekly day off, annual leave and what happens if either side wants to end the arrangement. Putting this in writing — even a simple one-page agreement — protects you and the person you hire.

## 5. Make the first week count

Show your new staff member around, explain how you like things done, and check in at the end of each day. Small conversations early on prevent bigger problems later.

> Good help starts with good communication. The clearer you are at the start, the happier everyone will be.

## Need help finding the right person?

Tell us what your home needs and our team will discuss suitable options with you. [Send us your requirements](/contact) or explore our [domestic staffing services](/services/maids-housekeepers).`,
  }),
  post({
    id: 'starter-live-in-vs-live-out',
    slug: 'live-in-vs-live-out-domestic-staff',
    title: 'Live-in vs Live-out Staff: Which Is Right for Your Home?',
    excerpt: 'Should your cook, maid or carer live with you or come in daily? Here are the practical pros and cons to help you decide.',
    cover: '/images/stock/cook.webp',
    seoTitle: 'Live-in vs Live-out Domestic Staff: Pros and Cons',
    seoDescription: 'Compare live-in and live-out domestic staff for your Pakistani household: availability, privacy, cost, accommodation and which roles suit each option.',
    publishedAt: '2026-10-25T09:00:00.000Z',
    body: `One of the first questions families ask when hiring household help is whether the person should live in the home or come in each day. Both options work well — the right choice depends on your routine, space and budget.

## Live-in staff

A live-in staff member stays at your home, usually in a separate room, and has agreed working hours and days off.

**Advantages**

- Help is available early in the morning and in the evening
- Useful for families with young children, elderly parents or long working days
- No daily travel, so fewer late arrivals

**Things to plan for**

- A private, clean room with a bed, fan or heating, and access to a washroom
- Meals, or an agreed food allowance
- Clear boundaries on working hours and rest time

## Live-out staff

A live-out staff member travels to your home for fixed hours and returns home at the end of the day.

**Advantages**

- More privacy for your family
- No need to provide accommodation
- Works well for part-time roles such as cleaning or cooking one or two meals a day

**Things to plan for**

- Reliable transport for your staff member, especially in bad weather
- Less flexibility for late evenings or emergencies

## Which roles suit which option?

- **Cooks and housekeepers:** either works; live-in suits larger households
- **Nannies and elderly carers:** live-in is often preferred for round-the-clock support
- **Drivers and guards:** usually live-out, with shift timings agreed in advance

## Still deciding?

You don't have to decide alone. [Tell us about your household](/contact) and we can talk through what would work best for you.`,
  }),
  post({
    id: 'starter-driver-questions',
    slug: 'questions-to-ask-before-hiring-a-driver',
    title: '7 Questions to Ask Before Hiring a Family Driver',
    excerpt: 'A good driver keeps your family safe on the road. Ask these seven questions in the interview to find someone you can trust.',
    cover: '/images/stock/driver.webp',
    seoTitle: '7 Questions to Ask Before Hiring a Driver in Pakistan',
    seoDescription: 'Hiring a family driver in Pakistan? Ask these seven interview questions about licence, experience, routes, safety and timings before you decide.',
    publishedAt: '2026-10-30T09:00:00.000Z',
    body: `Your driver will be responsible for your family's safety, often including school runs and late-night pickups. A short, structured interview helps you choose with confidence.

## 1. Do you have a valid driving licence?

Ask to see the original licence and check that it is current and covers the type of vehicle you own. Keep a copy along with their CNIC.

## 2. How many years have you driven professionally?

Experience with family driving is different from driving a taxi or delivery vehicle. Ask about previous employers and the kind of driving they did.

## 3. Which areas of the city do you know well?

A driver who knows your routes — school, office, market, hospital — will save time and avoid stress.

## 4. Can you drive both manual and automatic cars?

If you have more than one vehicle, make sure they are comfortable with each one.

## 5. How do you handle basic car care?

A good driver checks tyre pressure, oil and water, keeps the car clean and tells you when a service is due.

## 6. What timings can you work?

Agree start and finish times, days off, and how overtime for late evenings or long trips will be handled.

## 7. Can I speak to a previous employer?

A quick call to a former employer is one of the most useful checks you can make.

## A final tip

Before confirming, take a short test drive together on your usual route. You'll quickly see how calmly and carefully they drive.

Looking for a driver? Explore our [driver service](/services/drivers) or [contact us](/contact) to discuss your requirements.`,
  }),
];
